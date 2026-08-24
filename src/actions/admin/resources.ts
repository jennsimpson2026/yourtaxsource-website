"use server";

import { db } from "@/lib/db";
import { posts, categories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function createResource(data: {
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  status: "draft" | "published";
  featuredImageUrl?: string;
  seoDescription?: string;
}) {
  logger.info(`[RESOURCES_CMS] Creating resource: ${data.title}`);
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    logger.error("[RESOURCES_CMS] Unauthorized creation attempt");
    throw new Error("Unauthorized");
  }

  try {
    const [newPost] = await db.insert(posts).values({
      ...data,
      type: "resource",
      authorId: session.user.id,
      publishDate: data.status === "published" ? new Date() : null,
    }).returning();
    
    logger.info(`[RESOURCES_CMS] Resource created successfully: ${newPost.id}`);
    revalidatePath("/admin/resources");
    revalidatePath("/resources");
    return newPost;
  } catch (err) {
    logger.error("[RESOURCES_CMS] Create resource failed:", err);
    throw err;
  }
}

export async function updateResource(id: string, data: Partial<{
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  status: "draft" | "published";
  featuredImageUrl?: string;
  seoDescription?: string;
}>) {
  logger.info(`[RESOURCES_CMS] Updating resource: ${id}`);
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    logger.error("[RESOURCES_CMS] Unauthorized update attempt");
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

    logger.info(`[RESOURCES_CMS] Resource updated successfully: ${id}`);
    revalidatePath("/admin/resources");
    revalidatePath("/resources");
    revalidatePath(`/resources/${updatedPost.slug}`);
    return updatedPost;
  } catch (err) {
    logger.error("[RESOURCES_CMS] Update resource failed:", err);
    throw err;
  }
}

export async function getResource(id: string) {
  return await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });
}

export async function getCategories() {
  return await db.query.categories.findMany();
}
