import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, taxReturns } from "@/lib/db/schema";
import { eq, desc, like, or, and } from "drizzle-orm";
import { isStaff, staffOnlyResponse } from "@/lib/auth-utils";

export async function GET(req: Request) {
  if (!(await isStaff())) {
    return staffOnlyResponse();
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const year = searchParams.get("year");
  const status = searchParams.get("status");

  try {
    const clients = await db.query.users.findMany({
      where: (u, { and, eq, or, like }) => {
        const conditions = [eq(u.role, "CLIENT")];
        if (search) {
          conditions.push(or(like(u.name, `%${search}%`), like(u.email, `%${search}%`)) as any);
        }
        return and(...conditions);
      },
      columns: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      with: {
        taxReturns: {
          where: (tr, { and, eq }) => {
            const trConditions = [];
            if (year) trConditions.push(eq(tr.year, parseInt(year)));
            if (status) trConditions.push(eq(tr.status, status));
            return and(...trConditions);
          },
          orderBy: [desc(taxReturns.year)],
        },
      },
    });

    // Filter out clients if year/status was provided but they have no matching taxReturns
    const filteredClients = clients.filter(client => {
        if ((year || status) && client.taxReturns.length === 0) return false;
        return true;
    });

    // Flatten the response for easier UI consumption
    const formattedClients = filteredClients.map((client) => {
      const latestReturn = client.taxReturns?.[0] || null;
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        createdAt: client.createdAt,
        status: latestReturn?.status || (year || status ? "NO_MATCH" : "NO_RETURN"),
        paymentStatus: latestReturn?.paymentStatus || "N/A",
        year: latestReturn?.year || null,
      };
    });

    return NextResponse.json(formattedClients);
  } catch (error: any) {
    console.error("GET /api/admin/clients error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
