import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { qboConnection } from "@/lib/db/schema";
import Link from "next/link";
import { CheckCircle2, XCircle, RefreshCw, ExternalLink, Zap } from "lucide-react";
import { QboStatus } from "@/components/admin/QboStatus";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const qbo = await db.query.qboConnection.findFirst();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-brand-black">Admin Settings</h1>
      
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-brand-black">QuickBooks Online Integration</h2>
            <p className="text-brand-charcoal/60 text-sm">
              Connect your QuickBooks Online account to sync payments and customer data.
            </p>
          </div>
          {qbo ? (
            <span className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
              <CheckCircle2 size={16} /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
              <XCircle size={16} /> Not Connected
            </span>
          )}
        </div>

        {qbo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Company ID (Realm ID)</p>
                <p className="font-mono text-brand-black">{qbo.realmId}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Last Synced</p>
                <p className="text-brand-black">{new Date(qbo.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Link 
                href="/api/admin/qbo/connect"
                className="flex items-center gap-2 px-6 py-3 bg-brand-black text-white rounded-2xl font-bold text-sm hover:bg-opacity-90 transition-all"
              >
                <RefreshCw size={18} /> Reconnect QuickBooks
              </Link>
            </div>

            <QboStatus qbo={qbo} />
          </div>
        ) : (
          <div>
            <Link 
              href="/api/admin/qbo/connect"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#2CA01C] text-white rounded-2xl font-bold text-base hover:bg-opacity-90 transition-all shadow-lg shadow-green-200"
            >
              Connect to QuickBooks
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-brand-black mb-4">QuickBooks Sync Logs</h2>
        <p className="text-brand-charcoal/40 text-sm italic">
          Sync logs will appear here once integration is active.
        </p>
      </div>
    </div>
  );
}
