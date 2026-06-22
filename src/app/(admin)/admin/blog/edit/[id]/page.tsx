import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditBlogPostForm } from "@/components/admin/EditBlogPostForm";
import { getCategories } from "@/actions/admin/blog";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });

  if (!post) {
    notFound();
  }

  const categories = await getCategories();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <EditBlogPostForm post={post} categories={categories} />
    </div>
  );
}
