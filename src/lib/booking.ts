import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";
import "isomorphic-fetch";

const OWNER_EMAIL = "Jsimpson@yourtaxsource.com";
const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL || `https://outlook.office365.com/owa/calendar/${OWNER_EMAIL}/bookings/`;

export interface BookingDetails {
  id: string;
  startTime: Date;
  endTime: Date;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  location?: string;
  customFields?: Record<string, any>;
}

/**
 * Returns the public booking URL.
 */
export function getBookingUrl() {
  return BOOKING_URL;
}

/**
 * Microsoft Graph Client Setup
 */
export async function getGraphClient() {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Azure credentials (TENANT_ID, CLIENT_ID, CLIENT_SECRET) are not set.");
  }

  const credential = new ClientSecretCredential(
    tenantId,
    clientId,
    clientSecret
  );
  
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default']
  });

  return Client.initWithMiddleware({ authProvider });
}

/**
 * Fetches booking business details
 */
export async function getBookingBusiness(businessEmail: string = OWNER_EMAIL) {
  const client = await getGraphClient();
  // We need to find the business ID first or use the email if it works as an alias
  // Typically it's /solutions/bookingBusinesses/{id}
  const businesses = await client.api('/solutions/bookingBusinesses').get();
  return businesses.value.find((b: any) => b.email === businessEmail || b.displayName.includes("Your Tax Source"));
}

/**
 * Fetches a specific booking appointment
 */
export async function getBookingAppointment(businessId: string, appointmentId: string) {
  const client = await getGraphClient();
  return await client.api(`/solutions/bookingBusinesses/${businessId}/appointments/${appointmentId}`).get();
}

/**
 * Configure Booking Service settings
 */
export async function configureBookingService(businessId: string, serviceId: string) {
  const client = await getGraphClient();
  
  const serviceConfig = {
    defaultDuration: "PT1H", // 60 minutes
    preBuffer: "PT15M", // 15 minutes buffer before
    postBuffer: "PT15M", // 15 minutes buffer after
    schedulingPolicy: {
      allowAllowedSlotInLeadTime: "PT15M",
      minimumLeadTime: "PT24H",
      maximumAdvance: "P365D"
    }
  };

  return await client.api(`/solutions/bookingBusinesses/${businessId}/services/${serviceId}`).patch(serviceConfig);
}

/**
 * Map Graph API appointment to internal BookingDetails
 */
export function mapGraphAppointmentToBookingDetails(appointment: any): BookingDetails {
  // Extract custom questions
  const customFields: Record<string, any> = {};
  if (appointment.customQuestionAnswers) {
    appointment.customQuestionAnswers.forEach((answer: any) => {
      customFields[answer.questionId] = answer.answer;
    });
  }

  return {
    id: appointment.id,
    startTime: new Date(appointment.startDateTime.dateTime),
    endTime: new Date(appointment.endDateTime.dateTime),
    clientName: appointment.customerName,
    clientEmail: appointment.customerEmailAddress,
    serviceType: appointment.serviceName,
    location: appointment.locationName,
    customFields
  };
}
