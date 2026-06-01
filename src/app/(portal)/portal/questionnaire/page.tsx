import { getQuestionnaire } from "@/actions/questionnaires";
import { IntakeQuestionnaire } from "@/components/portal/IntakeQuestionnaire";
import { db } from "@/lib/db";
import { taxReturns } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export default async function QuestionnairePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;
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

  const questionnaire = await getQuestionnaire(returnEntry.id);
  const existingData = questionnaire ? JSON.parse(questionnaire.data) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-blue-900">Tax Intake</h1>
      <IntakeQuestionnaire returnId={returnEntry.id} existingData={existingData} />
    </div>
  );
}
