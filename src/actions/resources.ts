"use server";

import { db } from "@/lib/db";
import { posts, categories, users, auditLogs } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { s3Client, BUCKET_NAME, getPresignedUrl } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

// Resource Specific Actions
export async function getResourceUploadUrl(fileName: string, fileType: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role === "CLIENT") {
    throw new Error("Unauthorized");
  }

  const s3Key = `resources/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const region = process.env.AWS_REGION || "us-east-2";
  const fileUrl = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${s3Key}`;

  return { uploadUrl, s3Key, fileUrl };
}

export async function getResourceDownloadUrl(id: string) {
  console.log(`[DOWNLOAD] Requesting URL for resource ID: ${id}`);
  const resource = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });

  if (!resource || !resource.fileUrl) {
    console.error(`[DOWNLOAD] Resource or file not found for ID: ${id}`);
    throw new Error("Resource or file not found");
  }

  console.log(`[DOWNLOAD] Found resource: ${resource.title}, fileUrl: ${resource.fileUrl}`);

  // If it's a direct S3 URL, get a pre-signed URL
  if (resource.fileUrl.includes("amazonaws.com")) {
    const urlParts = resource.fileUrl.split(".com/");
    if (urlParts.length > 1) {
      const s3Key = decodeURIComponent(urlParts[1]);
      console.log(`[DOWNLOAD] Generating pre-signed URL for key: ${s3Key}`);
      try {
        const signedUrl = await getPresignedUrl(s3Key);
        console.log(`[DOWNLOAD] Generated signed URL successfully`);
        return signedUrl;
      } catch (err: any) {
        console.error(`[DOWNLOAD] Error generating signed URL: ${err.message}`);
        throw err;
      }
    }
  }

  return resource.fileUrl;
}
export async function createResource(data: any) {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'STAFF')) {
    throw new Error("Unauthorized");
  }

  try {
    const [newPost] = await db.insert(posts).values({
      ...data,
      type: "resource",
      authorId: (session.user as any).id,
      publishDate: data.status === 'published' ? new Date() : null,
    }).returning();

    await db.insert(auditLogs).values({
      userId: (session.user as any).id,
      action: "CREATE_RESOURCE",
      targetType: "POST",
      targetId: newPost.id,
      metadata: JSON.stringify({ title: data.title }),
    });

    revalidatePath("/resources");
    revalidatePath("/admin/resources");
    return { success: true, post: newPost };
  } catch (error) {
    console.error("Create resource error:", error);
    return { error: "Failed to create resource" };
  }
}

export async function updateResource(id: string, data: any) {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'STAFF')) {
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

    await db.insert(auditLogs).values({
      userId: (session.user as any).id,
      action: "UPDATE_RESOURCE",
      targetType: "POST",
      targetId: id,
      metadata: JSON.stringify({ title: data.title }),
    });

    revalidatePath("/resources");
    revalidatePath(`/resources/${updatedPost.slug}`);
    revalidatePath("/admin/resources");
    return { success: true, post: updatedPost };
  } catch (error) {
    console.error("Update resource error:", error);
    return { error: "Failed to update resource" };
  }
}

export async function deletePost(id: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
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
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
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
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
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
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
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
