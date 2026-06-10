import { getUserDocuments } from "@/actions/documents";
import { DocumentUpload } from "@/components/portal/DocumentUpload";
import { DocumentList } from "@/components/portal/DocumentList";

export default async function DocumentsPage() {
  const documents = await getUserDocuments();

  return (
    <div className="space-y-12 py-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-heading font-black text-brand-black">Document Center</h1>
        <p className="text-brand-charcoal/60 text-lg">Securely manage and upload your tax records.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <DocumentUpload />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-heading font-bold text-brand-black">Your Secure Folder</h2>
          <DocumentList documents={documents as any} />
        </div>
      </div>
    </div>
  );
}
