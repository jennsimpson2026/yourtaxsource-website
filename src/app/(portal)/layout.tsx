import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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
    <div className="flex flex-col min-h-screen bg-brand-cloud">
      <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-navy rounded flex items-center justify-center">
                 <span className="text-white font-bold">Y</span>
              </div>
              <span className="font-heading font-bold text-lg text-brand-navy hidden sm:block">
                Portal
              </span>
            </Link>
            
            <nav className="hidden md:flex gap-8">
              <NavLink href="/portal" label="Dashboard" />
              <NavLink href="/portal/documents" label="Documents" />
              <NavLink href="/portal/questionnaire" label="Intake Form" />
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-widest">Client</span>
              <span className="text-sm font-bold text-brand-navy">{session.user?.email}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>

      <footer className="py-6 border-t border-gray-200/60 text-center">
        <p className="text-xs text-brand-charcoal/40 font-medium">
          © 2024 Your Tax Source Secure Client Portal. All data is encrypted.
        </p>
      </footer>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href} 
      className="text-sm font-bold text-brand-charcoal/60 hover:text-brand-orange transition-colors"
    >
      {label}
    </Link>
  );
}
