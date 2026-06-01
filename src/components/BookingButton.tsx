import Link from "next/link";
import { getBookingUrl } from "@/lib/booking";
import { CalendarDays } from "lucide-react";

export function BookingButton({ className }: { className?: string }) {
  const bookingUrl = getBookingUrl();
  
  return (
    <Link
      href={bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className || "bg-brand-green text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition-all shadow-md flex items-center justify-center gap-2"}
    >
      <CalendarDays className="w-5 h-5" />
      Book an Appointment
    </Link>
  );
}
