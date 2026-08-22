import { getResourceDownloadUrl } from "@/actions/resources";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let downloadUrl: string;
  try {
    downloadUrl = await getResourceDownloadUrl(id);
  } catch (error) {
    console.error("Resource download error:", error);
    return new Response("Resource not found", { status: 404 });
  }

  redirect(downloadUrl);
}
