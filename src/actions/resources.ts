"use server";

import { db } from "@/lib/db";
import { posts, categories, users } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  return await db.query.categories.findMany();
}

export async function getPosts(options: { 
  categoryId?: string, 
  status?: string, 
  isFeatured?: boolean,
  limit?: number
} = {}) {
  const whereConditions = [];
  
  if (options.categoryId) {
    whereConditions.push(eq(posts.categoryId, options.categoryId));
  }
  
  if (options.status) {
    whereConditions.push(eq(posts.status, options.status));
  }
  
  if (options.isFeatured !== undefined) {
    whereConditions.push(eq(posts.isFeatured, options.isFeatured));
  }

  whereConditions.push(eq(posts.type, "resource"));

  return await db.query.posts.findMany({
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    orderBy: [desc(posts.publishDate), desc(posts.createdAt)],
    limit: options.limit,
    with: {
      category: true,
      author: true,
    }
  });
}

export async function getPostBySlug(slug: string) {
  return await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
    with: {
      category: true,
      author: true,
    }
  });
}

// Admin Actions
export async function createPost(data: any) {
  const session = await auth();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
    throw new Error("Unauthorized");
  }

  try {
    const [newPost] = await db.insert(posts).values({
      ...data,
      type: "resource",
      authorId: session.user.id,
      publishDate: data.status === 'published' ? new Date() : null,
    }).returning();

    revalidatePath("/resources");
    revalidatePath("/admin/resources");
    return { success: true, post: newPost };
  } catch (error) {
    console.error("Create post error:", error);
    return { error: "Failed to create post" };
  }
}

export async function updatePost(id: string, data: any) {
  const session = await auth();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
    throw new Error("Unauthorized");
  }

  try {
    const [updatedPost] = await db.update(posts)
      .set({
        ...data,
        publishDate: data.status === 'published' && !data.publishDate ? new Date() : data.publishDate,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    revalidatePath("/resources");
    revalidatePath(`/resources/${updatedPost.slug}`);
    revalidatePath("/admin/resources");
    return { success: true, post: updatedPost };
  } catch (error) {
    console.error("Update post error:", error);
    return { error: "Failed to update post" };
  }
}

export async function deletePost(id: string) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }

  try {
    await db.delete(posts).where(eq(posts.id, id));
    revalidatePath("/resources");
    revalidatePath("/admin/resources");
    return { success: true };
  } catch (error) {
    console.error("Delete post error:", error);
    return { error: "Failed to delete post" };
  }
}

export async function createCategory(data: any) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }

  try {
    const [newCategory] = await db.insert(categories).values(data).returning();
    revalidatePath("/admin/resources");
    return { success: true, category: newCategory };
  } catch (error) {
    console.error("Create category error:", error);
    return { error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, data: any) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }

  try {
    const [updatedCategory] = await db.update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    revalidatePath("/admin/resources");
    return { success: true, category: updatedCategory };
  } catch (error) {
    console.error("Update category error:", error);
    return { error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }

  // Check if category has posts
  const postCount = await db.select({ count: sql`count(*)` }).from(posts).where(eq(posts.categoryId, id));
  // @ts-ignore
  if (postCount[0].count > 0) {
    return { error: "Category is not empty. Please delete or move posts first." };
  }

  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/admin/resources");
    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { error: "Failed to delete category" };
  }
}
