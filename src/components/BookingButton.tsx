import Link from "next/link";
import { getBookingUrl } from "@/lib/booking";
import { CalendarDays } from "lucide-react";

export function BookingButton({ className, label }: { className?: string; label?: string }) {
  const bookingUrl = getBookingUrl();
  
  return (
    <Link
      href={bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className || "bg-brand-purple text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#5a3a74] transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"}
    >
      <CalendarDays className="w-5 h-5" />
      {label || "Book an Appointment"}
    </Link>
  );
}
