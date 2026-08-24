import axios from "axios";
import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getQboTokens, getOrCreateQboCustomer, qboRequest } from "@/lib/qbo";

const QBO_ENVIRONMENT = process.env.QBO_ENVIRONMENT || "sandbox";

/**
 * QBO Smart Reconciliation.
 * Hierarchy:
 *   1) Search for an open (unpaid) QBO Invoice → create a QBO Payment and
 *      link it to that invoice.
 *   2) Fallback: create a QBO Sales Receipt.
 *
 * When a surcharge applies it is recorded as a SEPARATE line item using the
 * label 'Merchant Processing Fee Recovery', so revenue is never duplicated.
 */
export const QBO_SURCHARGE_LINE_DESC = "Merchant Processing Fee Recovery";

async function qboQuery(query: string): Promise<any> {
  const tokens = await getQboTokens();
  if (!tokens) throw new Error("QBO not connected");

  const baseUrl =
    QBO_ENVIRONMENT === "sandbox"
      ? `https://sandbox-quickbooks.api.intuit.com/v3/company/${tokens.realmId}`
      : `https://quickbooks.api.intuit.com/v3/company/${tokens.realmId}`;

  const res = await axios({
    method: "GET",
    url: `${baseUrl}/query`,
    params: { query, minorversion: 65 },
    headers: { Authorization: `Bearer ${tokens.accessToken}`, Accept: "application/json" },
  });
  return res.data;
}

/** Search for an open QBO invoice for a customer that still has a balance. */
export async function findOpenQboInvoice(
  customerId: string,
  amount: number
): Promise<{ Id: string } | null> {
  const q = [
    "SELECT Id, Balance, CustomerRef FROM Invoice",
    `WHERE CustomerRef = '${customerId}' AND Balance > 0`,
    `AND Amount = ${Number(amount).toFixed(2)}`,
    "MAXRESULTS 5",
  ].join(" ");

  const data = await qboQuery(q);
  const found = data?.QueryResponse?.Invoice ?? [];
  return found && found.length > 0 ? { Id: String(found[0].Id) } : null;
}

/** Create a QBO Payment linked to an open invoice. */
export async function createQboPayment(input: {
  customerId: string;
  invoiceId: string;
  amount: number;
  method?: string;
}) {
  const data: any = {
    TotalAmt: Number(input.amount),
    CustomerRef: { value: input.customerId },
    Line: [
      {
        Amount: Number(input.amount),
        LinkedTxn: [{ TxnId: input.invoiceId, TxnType: "Invoice" }],
      },
    ],
  };
  if (input.method) {
    data.PaymentRefNum = `stripe-${input.method}`;
  }
  return await qboRequest("POST", "payment", data);
}

/** Create a QBO Sales Receipt, recording any surcharge as a separate line. */
export async function createQboSalesReceiptWithSurcharge(input: {
  customerId: string;
  amount: number;
  description: string;
  surchargeAmount?: number;
  paymentMethod?: string;
}) {
  const lines: any[] = [
    {
      Description: input.description,
      Amount: Number(input.amount),
      DetailType: "SalesItemLineDetail",
      SalesItemLineDetail: {
        ItemRef: { value: "1", name: "Services" },
        Qty: 1,
        UnitPrice: Number(input.amount),
      },
    },
  ];

  const surcharge = Number(input.surchargeAmount || 0);
  if (surcharge > 0) {
    lines.push({
      Description: QBO_SURCHARGE_LINE_DESC,
      Amount: surcharge,
      DetailType: "SalesItemLineDetail",
      SalesItemLineDetail: {
        ItemRef: { value: "1", name: "Services" },
        Qty: 1,
        UnitPrice: surcharge,
      },
    });
  }

  const data: any = {
    Line: lines,
    CustomerRef: { value: input.customerId },
  };
  if (input.paymentMethod) {
    data.DepositToAccountRef = { value: "1" };
  }
  return await qboRequest("POST", "salesreceipt", data);
}

/**
 * Smart-reconcile a paid local invoice to QBO.
 *
 * @param invoice The local (paid) invoice row.
 * @param surchargeAmount The card surcharge amount (0 if none).
 */
export async function smartReconcileToQbo(
  invoice: { id: string; userId: string; amount: number; qboInvoiceId?: string | null },
  surchargeAmount = 0
): Promise<{
  kind: "payment" | "salesReceipt";
  qboPaymentId?: string;
  qboSalesReceiptId?: string;
  qboInvoiceId?: string | null;
}> {
  const qboCustomerId = await getOrCreateQboCustomer(invoice.userId);
  const total = Number(invoice.amount) + Number(surchargeAmount || 0);

  // 1) Priority: match to an existing open QBO invoice -> create a linked Payment.
  const openInvoice = await findOpenQboInvoice(qboCustomerId, Number(invoice.amount)).catch(
    () => null
  );

  if (openInvoice) {
    const payment = await createQboPayment({
      customerId: qboCustomerId,
      invoiceId: openInvoice.Id,
      amount: total,
    });
    const qboPaymentId = payment.Payment?.Id ?? String(payment.Id);
    await db
      .update(invoices)
      .set({ qboInvoiceId: openInvoice.Id })
      .where(eq(invoices.id, invoice.id));
    return { kind: "payment", qboPaymentId, qboInvoiceId: openInvoice.Id };
  }

  // 2) Fallback: create a Sales Receipt (base + separate surcharge line).
  const receipt = await createQboSalesReceiptWithSurcharge({
    customerId: qboCustomerId,
    amount: Number(invoice.amount),
    description: `Tax Preparation Services - Invoice #${invoice.id.slice(0, 8)}`,
    surchargeAmount,
  });
  const qboSalesReceiptId = receipt.SalesReceipt?.Id ?? String(receipt.Id);
  await db
    .update(invoices)
    .set({ qboSalesReceiptId })
    .where(eq(invoices.id, invoice.id));
  return { kind: "salesReceipt", qboSalesReceiptId, qboInvoiceId: null };
}
