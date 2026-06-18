import { onboardBookingClient } from "./src/lib/onboarding";

async function main() {
  const mockBooking = {
    id: "mock-booking-" + Date.now(),
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    clientName: "E2E Test Client",
    clientEmail: "e2e_test_client@yourtaxsource.com",
    serviceType: "Tax Consultation",
    location: "Virtual",
    onlineMeetingUrl: "https://teams.microsoft.com/l/meetup-join/mock",
    customFields: {
      "How did you hear about us?": "E2E Testing",
      "Notes": "This is a test booking."
    }
  };

  console.log("Starting manual onboarding for:", mockBooking.clientEmail);
  try {
    const result = await onboardBookingClient(mockBooking);
    console.log("Onboarding result:", result);
  } catch (error) {
    console.error("Onboarding failed:", error);
  }
}

main().catch(console.error);
