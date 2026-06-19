import { getUserDocuments, getUserDocumentYears } from "@/actions/documents";
import { DocumentUpload } from "@/components/portal/DocumentUpload";
import { DocumentList } from "@/components/portal/DocumentList";
import { DocumentYearFilter } from "@/components/portal/DocumentYearFilter";
import { db } from "@/lib/db";
import { taxReturns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  const userId = (session.user as any).id;
  const year = searchParams.year ? parseInt(searchParams.year) : undefined;
  const documents = await getUserDocuments(year);
  const availableYears = await getUserDocumentYears();

  // Fetch latest return to associate generic uploads with the current season
  const latestReturn = await db.query.taxReturns.findFirst({
    where: eq(taxReturns.clientId, userId),
    orderBy: [desc(taxReturns.year)],
  });

  return (
    <div className="space-y-12 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-heading font-black text-brand-black">Document Center</h1>
          <p className="text-brand-charcoal/60 text-lg">Securely manage and upload your tax records.</p>
        </div>
        <DocumentYearFilter years={availableYears} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <DocumentUpload returnId={latestReturn?.id} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-heading font-bold text-brand-black">Your Secure Folder</h2>
          <DocumentList documents={documents as any} />
        </div>
      </div>
    </div>
  );
}
