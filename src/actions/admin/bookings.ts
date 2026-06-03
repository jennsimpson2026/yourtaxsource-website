"use server";

import { getGraphClient, getBookingBusiness } from "@/lib/booking";
import { revalidatePath } from "next/cache";

export async function setupBookingSubscription() {
  try {
    const business = await getBookingBusiness();
    if (!business) {
      throw new Error("Could not find Booking Business.");
    }

    const client = await getGraphClient();
    
    // Calculate expiration date (max is usually 3 days for some resources, but for appointments it varies)
    // For now set it to 2 days from now
    const expirationDateTime = new Date();
    expirationDateTime.setDate(expirationDateTime.getDate() + 2);

    const subscription = {
      changeType: "created,updated,deleted",
      notificationUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/bookings`,
      resource: `solutions/bookingBusinesses/${business.id}/appointments`,
      expirationDateTime: expirationDateTime.toISOString(),
      clientState: process.env.BOOKING_WEBHOOK_SECRET || "yts-secret-state"
    };

    const result = await client.api('/subscriptions').post(subscription);
    
    console.log("Subscription created:", result);
    return { success: true, subscriptionId: result.id };
  } catch (error: any) {
    console.error("Failed to setup subscription:", error);
    return { error: error.message || "Failed to setup subscription" };
  }
}

export async function listSubscriptions() {
  try {
    const client = await getGraphClient();
    const result = await client.api('/subscriptions').get();
    return { success: true, subscriptions: result.value };
  } catch (error: any) {
    console.error("Failed to list subscriptions:", error);
    return { error: error.message || "Failed to list subscriptions" };
  }
}

export async function renewSubscription(subscriptionId: string) {
  try {
    const client = await getGraphClient();
    const expirationDateTime = new Date();
    expirationDateTime.setDate(expirationDateTime.getDate() + 2);

    const result = await client.api(`/subscriptions/${subscriptionId}`).patch({
      expirationDateTime: expirationDateTime.toISOString()
    });

    return { success: true, result };
  } catch (error: any) {
    console.error("Failed to renew subscription:", error);
    return { error: error.message || "Failed to renew subscription" };
  }
}
