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
  console.log(`[BLOG_CMS] Creating post: ${data.title}`);
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    console.error("[BLOG_CMS] Unauthorized create attempt");
    throw new Error("Unauthorized");
  }

  try {
    const [newPost] = await db.insert(posts).values({
      ...data,
      authorId: (session.user as any).id,
      publishDate: data.status === "published" ? new Date() : null,
    }).returning();

    console.log(`[BLOG_CMS] Post created successfully: ${newPost.id}`);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return newPost;
  } catch (err) {
    console.error("[BLOG_CMS] Create post failed:", err);
    throw err;
  }
}

export async function updatePost(id: string, data: Partial<{
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  status: "draft" | "published";
  featuredImageUrl?: string;
}>) {
  console.log(`[BLOG_CMS] Updating post: ${id}`);
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    console.error("[BLOG_CMS] Unauthorized update attempt");
    throw new Error("Unauthorized");
  }

  try {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.status === "published") {
      updateData.publishDate = new Date();
    } else if (data.status === "draft") {
      updateData.publishDate = null;
    }

    const [updatedPost] = await db.update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();

    console.log(`[BLOG_CMS] Post updated successfully: ${id}`);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${updatedPost.slug}`);
    return updatedPost;
  } catch (err) {
    console.error("[BLOG_CMS] Update post failed:", err);
    throw err;
  }
}

export async function deletePost(id: string) {
  console.log(`[BLOG_CMS] Deleting post: ${id}`);
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    console.error("[BLOG_CMS] Unauthorized delete attempt");
    throw new Error("Unauthorized");
  }

  try {
    await db.delete(posts).where(eq(posts.id, id));
    console.log(`[BLOG_CMS] Post deleted successfully: ${id}`);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
  } catch (err) {
    console.error("[BLOG_CMS] Delete post failed:", err);
    throw err;
  }
}

export async function getCategories() {
  console.log("[BLOG_CMS] Fetching categories...");
  const cats = await db.query.categories.findMany();
  
  // If no categories exist, create some defaults to ensure the CMS is functional
  if (cats.length === 0) {
    console.log("[BLOG_CMS] No categories found, creating defaults...");
    try {
      const defaults = [
        { name: "Tax Tips", slug: "tax-tips" },
        { name: "Small Business", slug: "small-business" },
        { name: "News", slug: "news" },
      ];
      
      for (const cat of defaults) {
        await db.insert(categories).values(cat);
      }
      const newCats = await db.query.categories.findMany();
      console.log(`[BLOG_CMS] Default categories created: ${newCats.length}`);
      return newCats;
    } catch (err) {
      console.error("[BLOG_CMS] Failed to create default categories:", err);
      throw err;
    }
  }
  
  return cats;
}
