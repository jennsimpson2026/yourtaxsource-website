import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const post = await db.query.posts.findFirst({
      where: (p, { and, eq }) => and(eq(p.slug, slug), eq(p.status, "published")),
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
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error(`GET /api/blog/${slug} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
