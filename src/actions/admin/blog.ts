"use server";

import { db } from "@/lib/db";
import { posts, categories } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { eq } from "drizzle-orm";

export async function createPost(data: {
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  status: "draft" | "published";
  featuredImageUrl?: string;
}) {
  logger.info(`[BLOG_CMS] Creating post: ${data.title}`);
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    logger.error("[BLOG_CMS] Unauthorized create attempt");
    throw new Error("Unauthorized");
  }

  try {
    const [newPost] = await db.insert(posts).values({
      ...data,
      type: "blog",
      authorId: (session.user as any).id,
      publishDate: data.status === "published" ? new Date() : null,
    }).returning();

    logger.info(`[BLOG_CMS] Post created successfully: ${newPost.id}`);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return newPost;
  } catch (err) {
    logger.error("[BLOG_CMS] Create post failed:", err);
    throw err;
  }
}

export async function updatePost(id: string, data: Partial<{
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  status: "draft" | "published" | "scheduled";
  publishDate?: Date | string | null;
  featuredImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  socialDescription?: string;
  socialHashtags?: string;
  researchSources?: string;
}>) {
  logger.info(`[BLOG_CMS] Updating post: ${id}`);
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    logger.error("[BLOG_CMS] Unauthorized update attempt");
    throw new Error("Unauthorized");
  }

  try {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.publishDate) {
      updateData.publishDate = new Date(data.publishDate);
    } else if (data.status === "published") {
      updateData.publishDate = new Date();
    } else if (data.status === "draft") {
      updateData.publishDate = null;
    }

    const [updatedPost] = await db.update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();

    logger.info(`[BLOG_CMS] Post updated successfully: ${id}`);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${updatedPost.slug}`);
    return updatedPost;
  } catch (err) {
    logger.error("[BLOG_CMS] Update post failed:", err);
    throw err;
  }
}

export async function deletePost(id: string) {
  logger.info(`[BLOG_CMS] Deleting post: ${id}`);
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    logger.error("[BLOG_CMS] Unauthorized delete attempt");
    throw new Error("Unauthorized");
  }

  try {
    await db.delete(posts).where(eq(posts.id, id));
    logger.info(`[BLOG_CMS] Post deleted successfully: ${id}`);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
  } catch (err) {
    logger.error("[BLOG_CMS] Delete post failed:", err);
    throw err;
  }
}

export async function getCategories() {
  logger.info("[BLOG_CMS] Fetching categories...");
  const cats = await db.query.categories.findMany();
  
  // If no categories exist, create some defaults to ensure the CMS is functional
  if (cats.length === 0) {
    logger.info("[BLOG_CMS] No categories found, creating defaults...");
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
      logger.info(`[BLOG_CMS] Default categories created: ${newCats.length}`);
      return newCats;
    } catch (err) {
      logger.error("[BLOG_CMS] Failed to create default categories:", err);
      throw err;
    }
  }
  
  return cats;
}
