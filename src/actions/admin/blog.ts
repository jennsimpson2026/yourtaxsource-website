"use server";

import { db } from "@/lib/db";
import { posts, categories } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createPost(data: {
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  status: "draft" | "published";
  featuredImageUrl?: string;
}) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const [newPost] = await db.insert(posts).values({
    ...data,
    authorId: (session.user as any).id,
    publishDate: data.status === "published" ? new Date() : null,
  }).returning();

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return newPost;
}

export async function updatePost(id: string, data: Partial<{
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  status: "draft" | "published";
  featuredImageUrl?: string;
}>) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const updateData: any = { ...data, updatedAt: new Date() };
  if (data.status === "published") {
    updateData.publishDate = new Date();
  }

  const [updatedPost] = await db.update(posts)
    .set(updateData)
    .where(eq(posts.id, id))
    .returning();

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${updatedPost.slug}`);
  return updatedPost;
}

export async function deletePost(id: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await db.delete(posts).where(eq(posts.id, id));

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function getCategories() {
  return db.query.categories.findMany();
}
