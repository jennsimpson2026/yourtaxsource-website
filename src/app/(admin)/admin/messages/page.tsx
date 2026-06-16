export default function MessagesPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[600px] flex items-center justify-center p-12 text-center">
      <div>
        <div className="w-20 h-20 bg-brand-purple/5 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-purple">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-brand-black mb-2 font-heading">No Conversation Selected</h2>
        <p className="text-brand-charcoal/60 max-w-xs mx-auto">
          Select a client from the list on the left to view their messages or start a new conversation.
        </p>
      </div>
    </div>
  );
}
