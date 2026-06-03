import { NextRequest, NextResponse } from "next/server";
import { onboardBookingClient } from "@/lib/onboarding";
import { getBookingAppointment, getBookingBusiness, mapGraphAppointmentToBookingDetails } from "@/lib/booking";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const validationToken = searchParams.get("validationToken");

  // 1. Handle validation request
  if (validationToken) {
    return new Response(validationToken, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // 2. Handle notifications
  try {
    const body = await req.json();
    const notifications = body.value || [];

    for (const notification of notifications) {
      // notification.resource has the appointment URL, e.g., "solutions/bookingBusinesses/{id}/appointments/{id}"
      const resource = notification.resource;
      const resourceData = notification.resourceData;

      if (resourceData && resourceData["@odata.type"] === "#Microsoft.Graph.bookingAppointment") {
        // Extract business ID and appointment ID from resource string
        // Format: solutions/bookingBusinesses('businessId')/appointments('appointmentId')
        const businessMatch = resource.match(/bookingBusinesses\('([^']+)'\)/);
        const appointmentMatch = resource.match(/appointments\('([^']+)'\)/);

        if (businessMatch && appointmentMatch) {
          const businessId = businessMatch[1];
          const appointmentId = appointmentMatch[1];

          // Fetch full appointment details from Graph
          const appointment = await getBookingAppointment(businessId, appointmentId);
          const details = mapGraphAppointmentToBookingDetails(appointment);

          // Trigger onboarding
          await onboardBookingClient(details);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 202 });
  } catch (error) {
    console.error("Booking webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
