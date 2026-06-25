import { auth } from "@/lib/auth";

import { redirect } from "next/navigation";
import Link from "next/link";
import { PortalNavbar } from "@/components/portal/PortalNavbar";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-soft-gray">
      <PortalNavbar 
        userEmail={session.user?.email} 
        userRole={(session.user as any)?.role} 
      />
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>

      <footer className="py-8 bg-white border-t border-gray-100 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs text-brand-charcoal/40 font-medium mb-2">
            © 2024 Your Tax Source Secure Client Portal. All data is encrypted and stored securely.
          </p>
          <div className="flex justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/30">
            <span>SOC2 Compliant</span>
            <span>256-bit Encryption</span>
            <span>IRS Security Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
