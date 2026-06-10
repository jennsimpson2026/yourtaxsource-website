import { IntakeQuestionnaire } from "@/components/portal/IntakeQuestionnaire";
import { db } from "@/lib/db";
import { taxReturns } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function QuestionnairePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");
  
  const userId = (session.user as any).id;
  const currentYear = new Date().getFullYear();

  // Ensure a tax return entry exists for the current year
  let returnEntry = await db.query.taxReturns.findFirst({
    where: and(
      eq(taxReturns.clientId, userId),
      eq(taxReturns.year, currentYear)
    ),
  });

  if (!returnEntry) {
    [returnEntry] = await db.insert(taxReturns).values({
      clientId: userId,
      year: currentYear,
      status: "NOT_STARTED",
    }).returning();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-heading font-black text-brand-black">Tax Season {currentYear}</h1>
        <p className="text-brand-charcoal/60 text-lg">Please complete this questionnaire to help us prepare your return.</p>
      </div>
      <IntakeQuestionnaire returnId={returnEntry.id} />
    </div>
  );
}
