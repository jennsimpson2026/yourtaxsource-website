import { auth } from "@/lib/auth";

import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SignOutButton } from "@/components/SignOutButton";

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
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center shadow-lg shadow-brand-purple/20 transition-transform group-hover:scale-105">
                 <span className="text-white font-serif font-bold text-xl">Y</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-serif font-bold text-lg text-brand-black hidden sm:block">
                  Your Tax Source
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-purple/60 hidden sm:block">
                  Secure Portal
                </span>
              </div>
            </Link>
            
            <nav className="hidden md:flex gap-6 lg:gap-8">
              <NavLink href="/portal" label="Dashboard" />
              <NavLink href="/portal/documents" label="Documents" />
              <NavLink href="/portal/messages" label="Messages" />
              <NavLink href="/portal/questionnaire" label="Intake Form" />
              <NavLink href="/portal/resources" label="Resources" />
              {((session?.user as any)?.role === "ADMIN" || (session?.user as any)?.role === "STAFF") && (
                <NavLink href="/admin" label="Admin Hub" />
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[9px] font-black text-brand-purple/40 uppercase tracking-widest leading-none mb-1">
                {(session.user as any)?.role === "ADMIN" ? "Administrator" : (session.user as any)?.role === "STAFF" ? "Staff Member" : "Client Partner"}
              </span>
              <span className="text-xs font-bold text-brand-black">{session.user?.email}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>
      
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

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href} 
      className="text-sm font-bold text-brand-charcoal/60 hover:text-brand-purple transition-colors"
    >
      {label}
    </Link>
  );
}
