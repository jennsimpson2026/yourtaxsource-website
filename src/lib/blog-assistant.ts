import axios from "axios";
import { db } from "./db";
import { posts, categories, users } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { validatedEnv } from "./env";

const OPENAI_API_KEY = validatedEnv.OPENAI_API_KEY;
const TAVILY_API_KEY = validatedEnv.TAVILY_API_KEY;

interface ResearchResult {
  title: string;
  url: string;
  content: string;
}

interface BlogDraftOutput {
  title: string;
  slug: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  socialCaption: string;
  socialHashtags: string[];
  researchSources: string[];
}

export class BlogAssistant {
  private model: string;

  constructor(model: string = "gpt-4o") {
    this.model = model;
  }

  async research(topic: string): Promise<ResearchResult[]> {
    if (!TAVILY_API_KEY) {
      console.warn("TAVILY_API_KEY not set, skipping research");
      return [];
    }

    try {
      const response = await axios.post("https://api.tavily.com/search", {
        api_key: TAVILY_API_KEY,
        query: `latest tax rules and guidance for ${topic} from IRS.gov and state tax agencies 2024 2025`,
        search_depth: "advanced",
        include_domains: ["irs.gov", "tax.gov", "accountingtoday.com", "journalofaccountancy.com"],
        max_results: 5,
      });

      return response.data.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content,
      }));
    } catch (error) {
      console.error("Tavily research error:", error);
      return [];
    }
  }

  async generateDraft(topic: string, authorId: string): Promise<string> {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not set");
    }

    const researchResults = await this.research(topic);
    const researchContext = researchResults
      .map((r) => `Source: ${r.title} (${r.url})\nContent: ${r.content}`)
      .join("\n\n");

    // Fetch existing resources to link to
    const existingResources = await db.query.posts.findMany({
      where: eq(posts.type, "resource"),
      columns: {
        title: true,
        slug: true,
      }
    });

    const resourcesContext = existingResources
      .map(r => `- ${r.title}: /resources (Slug: ${r.slug})`)
      .join("\n");

    const prompt = `
You are an AI Blog Assistant for "Your Tax Source", a boutique tax preparation and advisory business in Belmont, NC.
The owner is Jenn Simpson. The voice is knowledgeable, approachable, practical, boutique, and easy for a normal taxpayer to understand.

TASK:
Research and write a timely, useful blog article about: "${topic}"

GUIDELINES:
1. USE MARKDOWN: Use H2 for section headings (##), bold for emphasis (**), and bullet points (-).
2. TONE: Approachable expertise. Avoid overly sales-focused or obviously AI-written language.
3. FACTS: Only use factual tax information grounded in the provided research sources. If information is missing or unclear, flag it with [STUB: MANUAL REVIEW NEEDED].
4. LINKS: Naturally link to relevant resources on the /resources page. 
   Available resources to link to:
   ${resourcesContext}
   IMPORTANT: Use the format [Resource Name](/resources) or similar internal link.
5. METADATA: Provide SEO and social media information.

RESEARCH SOURCES PROVIDED:
${researchContext}

OUTPUT FORMAT (JSON):
{
  "title": "Article Title",
  "slug": "article-slug",
  "content": "Full markdown content...",
  "seoTitle": "SEO Title (max 60 chars)",
  "seoDescription": "SEO Meta Description (max 160 chars)",
  "socialCaption": "Engaging social media caption",
  "socialHashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "researchSources": ["URL1", "URL2", ...]
}
`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: this.model,
        messages: [
          { role: "system", content: "You are a professional tax content writer. Output ONLY valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const draftData: BlogDraftOutput = JSON.parse(response.data.choices[0].message.content);

    // Get a category ID (default to "Tax Tips" or first one found)
    const category = await db.query.categories.findFirst({
      where: eq(categories.name, "Tax Tips")
    }) || await db.query.categories.findFirst();

    if (!category) throw new Error("No blog categories found in database");

    const postId = uuidv4();
    await db.insert(posts).values({
      id: postId,
      title: draftData.title,
      slug: draftData.slug,
      content: draftData.content,
      status: "draft",
      type: "blog",
      categoryId: category.id,
      authorId: authorId,
      seoTitle: draftData.seoTitle,
      seoDescription: draftData.seoDescription,
      socialDescription: draftData.socialCaption,
      socialHashtags: JSON.stringify(draftData.socialHashtags),
      researchSources: JSON.stringify(draftData.researchSources),
    });

    return postId;
  }
}
