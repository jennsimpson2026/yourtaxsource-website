import { db } from "@/lib/db";
import { posts, categories } from "@/lib/db/schema";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });

  if (!resource) {
    notFound();
  }

  const allCategories = await db.select().from(categories);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/resources"
          className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-brand-purple hover:border-brand-purple/20 transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-brand-black">Edit Resource</h1>
          <p className="text-brand-charcoal/60 text-sm">Update the details or file for this resource.</p>
        </div>
      </div>

      <ResourceForm initialData={resource} categories={allCategories} />
    </div>
  );
}
