import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin, adminOnlyResponse } from "@/lib/auth-utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<any> }
) {
  if (!(await isAdmin())) {
    return adminOnlyResponse();
  }

  const { id } = await params;

  try {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        category: true,
        author: {
          columns: {
            id: true,
            name: true,
          }
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error(`GET /api/admin/blog/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<any> }
) {
  if (!(await isAdmin())) {
    return adminOnlyResponse();
  }

  const { id } = await params;

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

    const [updatedPost] = await db
      .update(posts)
      .set({
        title,
        slug,
        content,
        featuredImageUrl,
        publishDate: publishDate ? new Date(publishDate) : null,
        status,
        categoryId,
        isFeatured: !!isFeatured,
        authorId,
        seoTitle,
        seoDescription,
        socialTitle,
        socialDescription,
        socialImage,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    console.error(`PUT /api/admin/blog/${id} error:`, error);
    if (error.code === "SQLITE_CONSTRAINT") {
      return NextResponse.json({ error: "Slug must be unique" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<any> }
) {
  if (!(await isAdmin())) {
    return adminOnlyResponse();
  }

  const { id } = await params;

  try {
    const [deletedPost] = await db.delete(posts).where(eq(posts.id, id)).returning();

    if (!deletedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error: any) {
    console.error(`DELETE /api/admin/blog/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
