"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ConversationList({ conversations }: { conversations: any[] }) {
  const pathname = usePathname();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-50 bg-gray-50/50">
        <h3 className="font-bold text-brand-black">Conversations</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <div className="p-8 text-center text-brand-charcoal/40 text-sm">
            No active conversations.
          </div>
        )}
        {conversations.map((conv) => {
          const isActive = pathname.includes(conv.user.id);
          return (
            <Link 
              key={conv.user.id} 
              href={`/admin/messages/${conv.user.id}`}
              className={`block p-4 border-b border-gray-50 transition-colors hover:bg-brand-purple/5 ${
                isActive ? "bg-brand-purple/5 border-r-4 border-r-brand-purple" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-brand-black text-sm truncate mr-2">{conv.user.name || conv.user.email}</span>
                <span className="text-[10px] text-brand-charcoal/30 whitespace-nowrap">
                  {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(conv.lastMessage.createdAt))}
                </span>
              </div>
              <p className="text-xs text-brand-charcoal/50 line-clamp-1 italic">
                {conv.lastMessage.content}
              </p>
              {conv.lastMessage.recipientId === conv.user.id && !conv.lastMessage.isRead && (
                  <span className="inline-block w-2 h-2 bg-brand-purple rounded-full mt-2"></span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
