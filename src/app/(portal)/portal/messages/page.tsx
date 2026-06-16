import { db } from "@/lib/db";
import { users, taxReturns } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MessageCenter } from "@/components/portal/MessageCenter";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/auth/login");
  }

  // @ts-ignore
  const userId = session.user.id;

  // Find a staff member to chat with
  // 1. Check if there's an assigned staff for any of the user's tax returns
  const userReturns = await db.query.taxReturns.findMany({
    where: eq(taxReturns.clientId, userId),
  });

  let staffId = userReturns.find(r => r.assignedStaffId)?.assignedStaffId;
  let staffName = "Your Tax Source Support";

  if (!staffId) {
    // 2. Fallback to any Admin or Staff
    const admin = await db.query.users.findFirst({
      where: or(eq(users.role, "ADMIN"), eq(users.role, "STAFF")),
    });
    if (admin) {
        staffId = admin.id;
        staffName = admin.name || "Support Team";
    }
  }

  if (!staffId) {
      return (
          <div className="max-w-4xl mx-auto py-12">
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                  <h1 className="text-2xl font-bold text-brand-black mb-4 font-heading">Message Center</h1>
                  <p className="text-brand-charcoal/60">Our team is currently unavailable for messaging. Please try again later or contact us via phone at (704) 825-9000.</p>
              </div>
          </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-brand-black">Messages</h1>
        <p className="text-brand-charcoal/60 mt-1 font-medium">Direct, secure communication with your tax professional.</p>
      </div>

      <MessageCenter 
        userId={userId} 
        otherUserId={staffId} 
        otherUserName={staffName} 
      />
      
      <div className="mt-6 bg-brand-purple/5 p-4 rounded-xl border border-brand-purple/10 flex gap-4 items-start shadow-sm">
        <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-purple" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-brand-purple uppercase tracking-wider">End-to-End Security</h4>
          <p className="text-xs text-brand-charcoal/60 leading-relaxed mt-0.5 font-medium">
            Your messages are encrypted at rest and in transit. Only authorized tax professionals at Your Tax Source can access this secure communication channel.
          </p>
        </div>
      </div>
    </div>
  );
}
