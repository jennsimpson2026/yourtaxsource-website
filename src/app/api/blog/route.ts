import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, categories } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");
  const isFeatured = searchParams.get("featured") === "true";

  try {
    const conditions = [eq(posts.status, "published")];
    
    if (isFeatured) {
      conditions.push(eq(posts.isFeatured, true));
    }

    const blogPosts = await db.query.posts.findMany({
      where: (p, { and, eq }) => {
        const baseConditions = [eq(p.status, "published")];
        if (isFeatured) baseConditions.push(eq(p.isFeatured, true));
        return and(...baseConditions);
      },
      with: {
        category: true,
        author: {
          columns: {
            id: true,
            name: true,
            image: true,
          }
        },
      },
      orderBy: [desc(posts.publishDate), desc(posts.createdAt)],
    });

    // Filter by category slug if provided (since we don't have categoryId in searchParams easily)
    let filteredPosts = blogPosts;
    if (categorySlug) {
      filteredPosts = blogPosts.filter(p => p.category.slug === categorySlug);
    }

    return NextResponse.json(filteredPosts);
  } catch (error: any) {
    logger.error("GET /api/blog error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
