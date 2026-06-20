
import { onboardBookingClient } from "../src/lib/onboarding";
import { BookingDetails } from "../src/lib/booking";
import { db } from "../src/lib/db";
import { users } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const details: BookingDetails = {
  id: "test-booking-id-" + Date.now(),
  startTime: new Date("2026-06-22T17:30:00Z"),
  endTime: new Date("2026-06-22T18:00:00Z"),
  clientName: "Test Client 2026",
  clientEmail: "test-client-2026@example.com",
  serviceType: "Tax Consultation",
  customFields: {
    "Tax Situation": "This is a test note for end-to-end verification."
  }
};

async function run() {
  console.log("Starting onboarding simulation...");
  try {
    const result = await onboardBookingClient(details);
    console.log("Onboarding complete:", result);
    
    const user = await db.query.users.findFirst({
      where: eq(users.email, "test-client-2026@example.com"),
    });
    console.log("Verified user in DB after insert:", user);
  } catch (error) {
    console.error("Onboarding failed:", error);
  }
  process.exit(0);
}

run();
