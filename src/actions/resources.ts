"use server";

import { db } from "@/lib/db";
import { posts, categories, users, auditLogs } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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
export async function getResourceUploadUrl(fileName: string, fileType: string, fileSize: number) {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'STAFF')) {
    throw new Error("Unauthorized");
  }

  // 1. Enforce file size (e.g., 20MB limit)
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(`File is too large. Maximum size allowed is 20MB.`);
  }

  // 2. Enforce file types
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/msword" // .doc
  ];

  if (!ALLOWED_TYPES.includes(fileType)) {
    throw new Error("Invalid file type. Only PDF, Excel, and Word documents are allowed.");
  }

  const s3Key = `resources/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return { uploadUrl, s3Key };
}

// Admin Actions
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
    // 1. If a new fileUrl is provided, delete the old file from S3
    const oldPost = await db.query.posts.findFirst({
      where: eq(posts.id, id),
    });

    if (data.fileUrl && oldPost?.fileUrl && data.fileUrl !== oldPost.fileUrl) {
      if (!oldPost.fileUrl.startsWith('http')) {
        console.log(`[updateResource] Deleting old S3 object: ${oldPost.fileUrl}`);
        try {
          const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: oldPost.fileUrl,
          });
          await s3Client.send(command);
        } catch (s3Error) {
          console.error("S3 delete error (orphaned file may remain):", s3Error);
        }
      }
    }

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
    // 1. Fetch post to get S3 key
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
    });

    if (post?.fileUrl && !post.fileUrl.startsWith('http')) {
      // 2. Delete from S3
      console.log(`[deletePost] Deleting S3 object: ${post.fileUrl}`);
      try {
        const command = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: post.fileUrl,
        });
        await s3Client.send(command);
      } catch (s3Error) {
        console.error("S3 delete error (orphaned file may remain):", s3Error);
        // Continue with DB deletion even if S3 fails
      }
    }

    // 3. Delete from DB
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
