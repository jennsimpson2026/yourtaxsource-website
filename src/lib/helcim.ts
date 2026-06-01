import axios from "axios";

const HELCIM_API_URL = "https://api.helcim.com/v2/";
const HELCIM_API_TOKEN = process.env.HELCIM_API_TOKEN;
const HELCIM_ACCOUNT_ID = process.env.HELCIM_ACCOUNT_ID;

const helcimClient = axios.create({
  baseURL: HELCIM_API_URL,
  headers: {
    "api-token": HELCIM_API_TOKEN,
    "Content-Type": "application/json",
  },
});

export async function createHelcimInvoice(data: {
  amount: number;
  currency: string;
  customerCode?: string;
  contactName: string;
  contactEmail: string;
}) {
  try {
    const response = await helcimClient.post("invoices", {
      amount: data.amount,
      currency: data.currency,
      customerCode: data.customerCode,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      // Add other necessary Helcim fields
    });
    return response.data;
  } catch (error: any) {
    console.error("Helcim Invoice Creation Error:", error.response?.data || error.message);
    throw new Error("Failed to create Helcim invoice");
  }
}

export async function getHelcimInvoice(invoiceId: string) {
  try {
    const response = await helcimClient.get(`invoices/${invoiceId}`);
    return response.data;
  } catch (error: any) {
    console.error("Helcim Get Invoice Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch Helcim invoice");
  }
}
