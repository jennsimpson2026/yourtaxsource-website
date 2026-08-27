import { Clock, Send, FileUp, Mail, CreditCard } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  createdAt: Date;
  metadata: string | null;
}

export function CommunicationLog({ logs }: { logs: AuditLog[] }) {
  // Filter only communication related logs
  const commActions = ["REQUEST_DOCUMENTS", "UPDATE_RETURN_STATUS", "PAYMENT_REQUEST_SENT"];
  const communicationLogs = logs.filter(log => commActions.includes(log.action));

  const isResent = (log: AuditLog) => {
    try {
      return log.metadata ? JSON.parse(log.metadata).resent === true : false;
    } catch { return false; }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 bg-gray-50/50">
        <h3 className="font-bold text-brand-navy flex items-center gap-2 text-lg">
          <Mail className="text-brand-orange" size={20} />
          Communication Log
        </h3>
      </div>
      
      <div className="divide-y divide-gray-50">
        {communicationLogs.length > 0 ? (
          communicationLogs.map((log) => {
            const resent = isResent(log);
            return (
            <div key={log.id} className="p-5 hover:bg-brand-cloud/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  log.action === 'REQUEST_DOCUMENTS' ? 'bg-orange-50 text-brand-orange'
                  : log.action === 'PAYMENT_REQUEST_SENT' ? 'bg-purple-50 text-brand-purple'
                  : 'bg-blue-50 text-brand-navy'
                }`}>
                  {log.action === 'REQUEST_DOCUMENTS' ? <Send size={14} />
                    : log.action === 'PAYMENT_REQUEST_SENT' ? <CreditCard size={14} />
                    : <FileUp size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-brand-navy">
                      {log.action === 'REQUEST_DOCUMENTS' ? 'Document Request Sent'
                        : log.action === 'PAYMENT_REQUEST_SENT' ? (resent ? 'Payment Request Resent' : 'Payment Request Sent')
                        : 'Status Update Sent'}
                    </p>
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase">
                      <Clock size={12} />
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {log.action === 'REQUEST_DOCUMENTS' && log.metadata && (
                    <p className="text-xs text-brand-charcoal/70 line-clamp-2 italic font-medium">
                      Requested: {JSON.parse(log.metadata).documentList}
                    </p>
                  )}
                  {log.action === 'UPDATE_RETURN_STATUS' && log.metadata && (
                    <p className="text-xs text-brand-charcoal/70 italic font-medium">
                      Status changed to: <span className="font-bold text-brand-navy">{JSON.parse(log.metadata).newStatus?.replace(/_/g, ' ')}</span>
                    </p>
                  )}
                  {log.action === 'PAYMENT_REQUEST_SENT' && log.metadata && (
                    <p className="text-xs text-brand-charcoal/70 italic font-medium">
                      Invoice: <span className="font-bold text-brand-navy">${(Number(JSON.parse(log.metadata).amount) || 0).toFixed(2)}</span>
                      {' • To: '}{JSON.parse(log.metadata).recipient}
                      {' • By: '}{JSON.parse(log.metadata).adminName}
                      {' • Send #'}{JSON.parse(log.metadata).sendCount}
                    </p>
                  )}
                </div>
              </div>
            </div>
            );
          })
        ) : (
          <div className="px-6 py-3 text-center flex items-center justify-center gap-2">
            <Mail className="text-gray-300" size={16} />
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">No communication history</p>
          </div>
        )}
      </div>
    </div>
  );
}
