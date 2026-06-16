import axios from "axios";
import { db } from "@/lib/db";
import { qboConnection, users, profiles, invoices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const QBO_CLIENT_ID = process.env.QBO_CLIENT_ID;
const QBO_CLIENT_SECRET = process.env.QBO_CLIENT_SECRET;
const QBO_REDIRECT_URI = process.env.QBO_REDIRECT_URI;
const QBO_ENVIRONMENT = process.env.QBO_ENVIRONMENT || "sandbox";

const DISCOVERY_URL = QBO_ENVIRONMENT === "sandbox" 
  ? "https://developer.intuit.com/.well-known/openid_configuration/"
  : "https://developer.intuit.com/.well-known/openid_configuration/"; // Usually the same

const TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const REVOKE_URL = "https://developer.api.intuit.com/v2/oauth2/tokens/revoke";

export function getQboAuthUrl() {
  const scopes = [
    "com.intuit.quickbooks.accounting",
    "com.intuit.quickbooks.payment",
    "openid",
    "profile",
    "email",
  ];
  
  const url = new URL("https://appcenter.intuit.com/connect/oauth2");
  url.searchParams.append("client_id", QBO_CLIENT_ID!);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", scopes.join(" "));
  url.searchParams.append("redirect_uri", QBO_REDIRECT_URI!);
  url.searchParams.append("state", "qbo-connect"); // Should be a random CSRF token in prod

  return url.toString();
}

export async function exchangeQboCode(code: string, realmId: string) {
  const authHeader = Buffer.from(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`).toString("base64");
  
  const response = await axios.post(TOKEN_URL, new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: QBO_REDIRECT_URI!,
  }), {
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { access_token, refresh_token, expires_in, x_refresh_token_expires_in } = response.data;

  const expiresAt = new Date(Date.now() + expires_in * 1000);
  const refreshTokenExpiresAt = new Date(Date.now() + x_refresh_token_expires_in * 1000);

  // Store in DB
  const existing = await db.query.qboConnection.findFirst();
  if (existing) {
    await db.update(qboConnection)
      .set({
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
        refreshTokenExpiresAt,
        realmId,
        updatedAt: new Date(),
      })
      .where(eq(qboConnection.id, existing.id));
  } else {
    await db.insert(qboConnection).values({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt,
      refreshTokenExpiresAt,
      realmId,
    });
  }

  return response.data;
}

export async function getQboTokens() {
  const connection = await db.query.qboConnection.findFirst();
  if (!connection) return null;

  // Check if access token is expired (with 5 min buffer)
  if (connection.expiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
    return await refreshQboTokens(connection.refreshToken);
  }

  return connection;
}

async function refreshQboTokens(refreshToken: string) {
  const authHeader = Buffer.from(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`).toString("base64");
  
  const response = await axios.post(TOKEN_URL, new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  }), {
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { access_token, refresh_token: new_refresh_token, expires_in, x_refresh_token_expires_in } = response.data;

  const expiresAt = new Date(Date.now() + expires_in * 1000);
  const refreshTokenExpiresAt = new Date(Date.now() + x_refresh_token_expires_in * 1000);

  const connection = await db.query.qboConnection.findFirst();
  if (connection) {
    await db.update(qboConnection)
      .set({
        accessToken: access_token,
        refreshToken: new_refresh_token,
        expiresAt,
        refreshTokenExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(qboConnection.id, connection.id));
  }

  return {
    accessToken: access_token,
    refreshToken: new_refresh_token,
    realmId: connection?.realmId,
  };
}

export async function qboRequest(method: string, endpoint: string, data?: any) {
  const tokens = await getQboTokens();
  if (!tokens) throw new Error("QBO not connected");

  const baseUrl = QBO_ENVIRONMENT === "sandbox"
    ? `https://sandbox-quickbooks.api.intuit.com/v3/company/${tokens.realmId}`
    : `https://quickbooks.api.intuit.com/v3/company/${tokens.realmId}`;

  const response = await axios({
    method,
    url: `${baseUrl}/${endpoint}`,
    data,
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    params: {
      minorversion: 65,
    },
  });

  return response.data;
}

export async function createQboCustomer(client: { name: string; email: string; phone?: string }) {
  const data = {
    DisplayName: client.name,
    PrimaryEmailAddr: {
      Address: client.email,
    },
    PrimaryPhone: client.phone ? {
      FreeFormNumber: client.phone,
    } : undefined,
  };

  return await qboRequest("POST", "customer", data);
}

export async function createQboSalesReceipt(data: {
  customerId: string;
  amount: number;
  description: string;
  paymentMethod?: string;
}) {
  const receiptData = {
    Line: [
      {
        Description: data.description,
        Amount: data.amount,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: {
            value: "1", // General services - should be configurable
            name: "Services",
          },
          Qty: 1,
          UnitPrice: data.amount,
        },
      },
    ],
    CustomerRef: {
      value: data.customerId,
    },
    // Add payment method if needed
  };

  return await qboRequest("POST", "salesreceipt", receiptData);
}

export async function createQboInvoice(data: {
  customerId: string;
  amount: number;
  description: string;
  dueDate?: string;
}) {
  const invoiceData = {
    Line: [
      {
        Description: data.description,
        Amount: data.amount,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: {
            value: "1",
            name: "Services",
          },
          Qty: 1,
          UnitPrice: data.amount,
        },
      },
    ],
    CustomerRef: {
      value: data.customerId,
    },
    DueDate: data.dueDate || new Date().toISOString().split("T")[0],
    AllowOnlineACHPayment: true,
    AllowOnlineCreditCardPayment: true,
  };

  return await qboRequest("POST", "invoice", invoiceData);
}

export async function getQboInvoice(invoiceId: string) {
  return await qboRequest("GET", `invoice/${invoiceId}`);
}

export async function createIntuitPaymentLink(amount: number, currency: string, description: string, context?: any) {
  // Use the Intuit Payments API v4
  // Documentation: https://developer.intuit.com/app/developer/qbpayments/docs/api/resources/all-entities/paymentlinks
  const tokens = await getQboTokens();
  if (!tokens) throw new Error("QBO not connected");

  const baseUrl = QBO_ENVIRONMENT === "sandbox"
    ? "https://sandbox.api.intuit.com/quickbooks/pay/v4"
    : "https://api.intuit.com/quickbooks/pay/v4";

  const response = await axios({
    method: "POST",
    url: `${baseUrl}/payment-links`,
    data: {
      amount: amount.toFixed(2),
      currency: currency,
      description: description,
      // Optional: link it to a QBO customer or invoice if we have one
      // But for simple checkout, we can just use these
    },
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Content-Type": "application/json",
      "Request-Id": crypto.randomUUID(),
    },
  });

  return response.data;
}

export async function getOrCreateQboCustomer(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      profile: true,
    },
  });

  if (!user) throw new Error("User not found");

  if ((user.profile as any)?.qboCustomerId) {
    return (user.profile as any).qboCustomerId;
  }

  // Create in QBO
  const qboCustomer = await createQboCustomer({
    name: user.name || "Unknown Client",
    email: user.email,
    phone: (user.profile as any)?.phone,
  });

  const qboCustomerId = qboCustomer.Customer.Id;

  // Update DB
  await db.update(profiles)
    .set({ qboCustomerId })
    .where(eq(profiles.userId, userId));

  return qboCustomerId;
}

export async function syncPaymentToQbo(invoiceId: string) {
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
    with: {
      user: true,
    },
  });

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status !== "PAID") throw new Error("Invoice not paid");
  if (invoice.qboSalesReceiptId) return invoice.qboSalesReceiptId;

  const qboCustomerId = await getOrCreateQboCustomer(invoice.userId);

  const receipt = await createQboSalesReceipt({
    customerId: qboCustomerId,
    amount: Number(invoice.amount),
    description: `Tax Preparation Services - Invoice #${invoice.id.slice(0, 8)}`,
  });

  const qboSalesReceiptId = receipt.SalesReceipt.Id;

  // Update DB
  await db.update(invoices)
    .set({ qboSalesReceiptId })
    .where(eq(invoices.id, invoiceId));

  return qboSalesReceiptId;
}
