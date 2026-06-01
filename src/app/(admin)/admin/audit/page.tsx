import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Clock, Shield, User as UserIcon, Activity } from "lucide-react";

export default async function AuditLogPage() {
  const logs = await db.query.auditLogs.findMany({
    with: {
      user: true,
    },
    orderBy: [desc(auditLogs.createdAt)],
    limit: 100,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-heading font-bold text-brand-navy">Audit Logs</h1>
        <p className="text-brand-charcoal/60 mt-1 font-medium">Security and activity tracking for the entire system.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <th className="px-6 py-5">Timestamp</th>
                <th className="px-6 py-5">User</th>
                <th className="px-6 py-5">Action</th>
                <th className="px-6 py-5">Target</th>
                <th className="px-6 py-5">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-brand-cloud/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-brand-charcoal/60 font-bold">
                      <Clock size={14} className="text-gray-300" />
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-brand-cloud rounded-full flex items-center justify-center text-brand-navy border border-gray-100">
                        <UserIcon size={14} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-brand-navy">{(log as any).user?.name || (log as any).user?.email || "System"}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{(log as any).user?.role || 'SYSTEM'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-[10px] font-bold rounded-full bg-blue-50 text-brand-navy border border-blue-100 uppercase">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-bold text-brand-charcoal/80">
                      {log.targetType}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      {log.targetId ? `#${log.targetId.slice(0, 8)}` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate font-medium">
                    {log.metadata}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <div className="p-20 text-center">
            <Shield className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400 font-medium uppercase tracking-widest text-sm">No activity recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
