import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, categories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { isAdmin, adminOnlyResponse } from "@/lib/auth-utils";

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return adminOnlyResponse();
  }

  try {
    const blogPosts = await db.query.posts.findMany({
      with: {
        category: true,
        author: {
          columns: {
            id: true,
            name: true,
          }
        },
      },
      orderBy: [desc(posts.createdAt)],
    });

    return NextResponse.json(blogPosts);
  } catch (error: any) {
    console.error("GET /api/admin/blog error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return adminOnlyResponse();
  }

  try {
    const body = await req.json();
    const { 
      title, 
      slug, 
      content, 
      featuredImageUrl, 
      publishDate, 
      status, 
      categoryId, 
      isFeatured, 
      authorId,
      seoTitle,
      seoDescription,
      socialTitle,
      socialDescription,
      socialImage
    } = body;

    if (!title || !slug || !content || !categoryId || !authorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newPost] = await db.insert(posts).values({
      title,
      slug,
      content,
      featuredImageUrl,
      publishDate: publishDate ? new Date(publishDate) : null,
      status: status || "draft",
      categoryId,
      isFeatured: !!isFeatured,
      authorId,
      seoTitle,
      seoDescription,
      socialTitle,
      socialDescription,
      socialImage
    }).returning();

    return NextResponse.json(newPost);
  } catch (error: any) {
    console.error("POST /api/admin/blog error:", error);
    if (error.code === "SQLITE_CONSTRAINT") {
      return NextResponse.json({ error: "Slug must be unique" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
