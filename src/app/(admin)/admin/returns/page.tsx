import { db } from "@/lib/db";
import { taxReturns, users } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { WorkflowManagementTable } from "@/components/admin/WorkflowManagementTable";

export default async function ReturnsAdminPage() {
  const returns = await db.query.taxReturns.findMany({
    with: {
      client: true,
      invoices: true,
    },
    orderBy: [desc(taxReturns.createdAt)],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-heading font-bold text-brand-navy">Tax Workflow</h1>
        <p className="text-brand-charcoal/60 mt-1 font-medium">Manage and review all client tax filings through the 6-step process.</p>
      </div>

      <WorkflowManagementTable returns={returns} />
    </div>
  );
}
