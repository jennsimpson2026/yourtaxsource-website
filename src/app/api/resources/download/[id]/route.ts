import { getResourceDownloadUrl } from "@/actions/resources";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const downloadUrl = await getResourceDownloadUrl(id);
    redirect(downloadUrl);
  } catch (error) {
    console.error("Resource download error:", error);
    return new Response("Resource not found", { status: 404 });
  }
}
