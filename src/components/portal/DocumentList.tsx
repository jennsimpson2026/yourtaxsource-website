"use client";

import { getDownloadUrl, softDeleteDocument } from "@/actions/documents";

interface Document {
  id: string;
  fileName: string;
  category: string;
  uploadedAt: Date;
}

export function DocumentList({ documents }: { documents: Document[] }) {
  async function handleDownload(docId: string) {
    try {
      const url = await getDownloadUrl(docId);
      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      alert("Error downloading document");
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Are you sure you want to delete this document? It will be permanently removed after 30 days.")) {
      return;
    }
    try {
      await softDeleteDocument(docId);
    } catch (error) {
      console.error(error);
      alert("Error deleting document");
    }
  }

  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.fileName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <button
                  onClick={() => handleDownload(doc.id)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {documents.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                No documents found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
