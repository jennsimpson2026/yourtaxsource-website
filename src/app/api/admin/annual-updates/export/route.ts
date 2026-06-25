import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, taxReturns, annualUpdates } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { isStaff, staffOnlyResponse } from "@/lib/auth-utils";
import { decrypt } from "@/lib/crypto";
import { logPiiExport } from "@/lib/audit";

export async function GET(req: Request) {
  if (!(await isStaff())) {
    return staffOnlyResponse();
  }

  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const status = searchParams.get("status");

  try {
    const updates = await db.query.annualUpdates.findMany({
      where: (au, { and, eq }) => {
        const conditions = [];
        if (status) conditions.push(eq(au.status, status));
        return and(...conditions);
      },
      with: {
        client: true,
        taxReturn: true
      }
    });

    // Filter by year if needed (manual filter after fetch due to Drizzle Query API limitations in complex where on relations)
    let filteredUpdates = updates;
    if (year) {
        filteredUpdates = updates.filter(u => u.taxReturn.year === parseInt(year));
    }

    // Generate CSV
    const headers = [
      "Client Name",
      "Email",
      "Year",
      "Status",
      "Prior Year Changes",
      "Tax Info",
      "Dependents",
      "Banking Info"
    ];

    const rows = filteredUpdates.map(u => {
      let banking = "";
      if (u.bankingInfo) {
        try {
          const b = JSON.parse(u.bankingInfo);
          if (b.accountNumber) b.accountNumber = decrypt(b.accountNumber);
          banking = JSON.stringify(b);
        } catch (e) {
           banking = u.bankingInfo;
        }
      }

      let dependents = "";
      if (u.dependents) {
        try {
          const deps = JSON.parse(u.dependents);
          deps.forEach((d: any) => {
            if (d.ssn) d.ssn = decrypt(d.ssn);
          });
          dependents = JSON.stringify(deps);
        } catch (e) {
           dependents = u.dependents;
        }
      }

      return [
        u.client.name,
        u.client.email,
        u.taxReturn.year,
        u.status,
        u.priorYearChanges,
        u.taxInfo,
        dependents,
        banking
      ].map(val => {
          const str = (val || "").toString();
          return `"${str.replace(/"/g, '""')}"`;
      }).join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    // Log the export action
    await logPiiExport(filteredUpdates.length, year || "all");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=annual_updates_${year || "all"}.csv`,
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
