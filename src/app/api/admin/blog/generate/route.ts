import { auth } from "@/lib/auth";
import { BlogAssistant } from "@/lib/blog-assistant";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/notifications";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { topic } = await req.json();
    if (!topic) {
      return new NextResponse("Topic is required", { status: 400 });
    }

    const assistant = new BlogAssistant();
    const authorId = (session.user as any).id;
    
    console.log(`[AI_BLOG] Generating draft for topic: "${topic}"...`);
    const postId = await assistant.generateDraft(topic, authorId);
    console.log(`[AI_BLOG] Draft created: ${postId}`);

    // Notify owner
    try {
      const draftUrl = `${process.env.NEXTAUTH_URL || 'https://your-tax-source-main.vercel.app'}/admin/blog/edit/${postId}`;
      await sendEmail({
        to: session.user?.email || "jenn@yourtaxsource.com",
        subject: "New AI Blog Draft Ready for Review",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6d28d9;">New Blog Draft Generated</h2>
            <p>Hello Jenn,</p>
            <p>The AI Blog Assistant has finished researching and drafting a new article about <strong>"${topic}"</strong>.</p>
            <p>You can review, edit, and publish the draft using the link below:</p>
            <a href="${draftUrl}" style="display: inline-block; background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">Review Draft</a>
            <p style="color: #666; font-size: 14px;">This draft was generated based on primary sources including IRS.gov.</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error("[AI_BLOG] Failed to send notification email:", emailErr);
    }

    return NextResponse.json({ success: true, postId });
  } catch (error: any) {
    console.error("[AI_BLOG] Generation error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
