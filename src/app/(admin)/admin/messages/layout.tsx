import { getRecentConversations } from "@/actions/messages";
import { ConversationList } from "@/components/admin/ConversationList";

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await getRecentConversations();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-brand-black">Message Center</h1>
        <p className="text-brand-charcoal/60 mt-1">Manage all client communications securely.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4">
          <ConversationList conversations={conversations} />
        </div>
        <div className="col-span-12 lg:col-span-8">
          {children}
        </div>
      </div>
    </div>
  );
}
