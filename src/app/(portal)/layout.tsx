import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SignOutButton } from "@/components/SignOutButton";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-soft-gray">
      <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 h-12 bg-brand-purple rounded-xl flex items-center justify-center shadow-sm">
                 <span className="text-white font-bold text-xl">Y</span>
              </div>
              <span className="font-heading font-bold text-xl text-brand-black hidden sm:block">
                Secure Client Portal
              </span>
            </Link>
            
            <nav className="hidden md:flex gap-8">
              <NavLink href="/portal" label="Dashboard" />
              <NavLink href="/portal/documents" label="Documents" />
              <NavLink href="/portal/messages" label="Messages" />
              <NavLink href="/portal/questionnaire" label="Intake Form" />
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/" className="hidden md:block mr-4">
              <Image 
                src="/images/logo-long.png" 
                alt="Your Tax Source Logo" 
                width={120} 
                height={32} 
                className="h-16 w-auto object-contain"
              />
            </Link>
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest leading-none mb-1">Authenticated Client</span>
              <span className="text-sm font-bold text-brand-black">{session.user?.email}</span>
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
