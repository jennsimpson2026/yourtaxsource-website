import { getUserDocuments } from "@/actions/documents";
import { DocumentUpload } from "@/components/portal/DocumentUpload";
import { DocumentList } from "@/components/portal/DocumentList";

export default async function DocumentsPage() {
  const documents = await getUserDocuments();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-900">Document Center</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <DocumentUpload />
        </div>
        
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Your Uploaded Documents</h2>
          <DocumentList documents={documents} />
        </div>
      </div>
    </div>
  );
}
