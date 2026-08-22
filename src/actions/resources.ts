"use server";

import { db } from "@/lib/db";
import { posts, categories, users, auditLogs, resourceAttachments } from "@/lib/db/schema";
import { eq, desc, and, sql, asc } from "drizzle-orm";
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
      attachments: {
        orderBy: [asc(resourceAttachments.sortOrder)]
      }
    }
  });
}

export async function getPostBySlug(slug: string) {
  return await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
    with: {
      category: true,
      author: true,
      attachments: {
        orderBy: [asc(resourceAttachments.sortOrder)]
      }
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
  console.log(`[DOWNLOAD] Requesting URL for ID: ${id}`);
  
  // 1. Try to find an attachment first
  const attachment = await db.query.resourceAttachments.findFirst({
    where: eq(resourceAttachments.id, id),
  });

  if (attachment) {
    console.log(`[DOWNLOAD] Found attachment: ${attachment.label}, fileUrl: ${attachment.fileUrl}`);
    return await generateSignedUrlIfNeeded(attachment.fileUrl);
  }

  // 2. Fallback to resource (legacy support)
  const resource = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });

  if (resource && resource.fileUrl) {
    console.log(`[DOWNLOAD] Found resource: ${resource.title}, fileUrl: ${resource.fileUrl}`);
    return await generateSignedUrlIfNeeded(resource.fileUrl);
  }

  console.error(`[DOWNLOAD] Resource or attachment not found for ID: ${id}`);
  throw new Error("Resource or file not found");
}

async function generateSignedUrlIfNeeded(fileUrl: string) {
  // If it's a direct S3 URL, get a pre-signed URL
  if (fileUrl.includes("amazonaws.com")) {
    const urlParts = fileUrl.split(".com/");
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

  return fileUrl;
}
export async function createResource(data: any) {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'STAFF')) {
    throw new Error("Unauthorized");
  }

  const { attachments, ...postData } = data;

  try {
    const [newPost] = await db.insert(posts).values({
      ...postData,
      type: "resource",
      authorId: (session.user as any).id,
      publishDate: postData.status === 'published' ? new Date() : null,
    }).returning();

    if (attachments && attachments.length > 0) {
      await db.insert(resourceAttachments).values(
        attachments.map((att: any, index: number) => ({
          resourceId: newPost.id,
          fileUrl: att.fileUrl,
          fileName: att.fileName,
          label: att.label,
          fileType: att.fileType,
          sortOrder: att.sortOrder ?? index,
        }))
      );
    }

    await db.insert(auditLogs).values({
      userId: (session.user as any).id,
      action: "CREATE_RESOURCE",
      targetType: "POST",
      targetId: newPost.id,
      metadata: JSON.stringify({ title: postData.title }),
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

  const { attachments, ...postData } = data;

  try {
    const [updatedPost] = await db.update(posts)
      .set({
        ...postData,
        publishDate: postData.status === 'published' && !postData.publishDate ? new Date() : postData.publishDate,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    if (attachments) {
      // Delete existing attachments and re-insert the new ones
      await db.delete(resourceAttachments).where(eq(resourceAttachments.resourceId, id));
      
      if (attachments.length > 0) {
        await db.insert(resourceAttachments).values(
          attachments.map((att: any, index: number) => ({
            id: att.id || undefined, // Drizzle will generate if undefined and we have a defaultFn, but we can also use crypto.randomUUID()
            resourceId: id,
            fileUrl: att.fileUrl,
            fileName: att.fileName,
            label: att.label,
            fileType: att.fileType,
            sortOrder: att.sortOrder ?? index,
          }))
        );
      }
    }

    await db.insert(auditLogs).values({
      userId: (session.user as any).id,
      action: "UPDATE_RESOURCE",
      targetType: "POST",
      targetId: id,
      metadata: JSON.stringify({ title: postData.title }),
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
