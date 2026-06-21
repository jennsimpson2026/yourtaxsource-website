import { auth } from "@/lib/auth";

import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { Users, FileText, LayoutDashboard, ShieldCheck, Home, BookOpen, Settings, MessageSquare } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user as any).role === "CLIENT") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-brand-soft-gray">
      <aside className="w-64 bg-brand-black text-white flex flex-col sticky top-0 h-screen shadow-2xl">
        <div className="p-8 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-purple rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
               <span className="text-white font-bold text-xl">Y</span>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg leading-tight text-white">Admin Hub</span>
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Your Tax Source</span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-4 ml-2">Management</p>
          <AdminNavLink href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <AdminNavLink href="/admin/users" icon={<Users size={20} />} label="Users" />
          <AdminNavLink href="/admin/returns" icon={<FileText size={20} />} label="Tax Returns" />
          <AdminNavLink href="/admin/messages" icon={<MessageSquare size={20} />} label="Messages" />
          <AdminNavLink href="/admin/blog" icon={<FileText size={20} />} label="Blog CMS" />
          <AdminNavLink href="/admin/resources" icon={<BookOpen size={20} />} label="Resources CMS" />
          <AdminNavLink href="/admin/audit" icon={<ShieldCheck size={20} />} label="Audit Logs" />
          <AdminNavLink href="/admin/settings" icon={<Settings size={20} />} label="Settings" />
          
          <div className="pt-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-4 ml-2">Quick Links</p>
            <AdminNavLink href="/" icon={<Home size={20} />} label="View Website" />
          </div>
        </nav>
        
        <div className="p-8 border-t border-white/10 bg-black/10">
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Logged in as</p>
            <p className="text-sm font-bold truncate">{session.user?.email}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>
      
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function AdminNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all font-medium text-white/80 hover:text-white group"
    >
      <span className="text-white/40 group-hover:text-brand-purple transition-colors">{icon}</span>
      {label}
    </Link>
  );
}
