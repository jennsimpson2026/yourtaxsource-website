"use client";

import { useState, useEffect, useRef } from "react";
import { sendMessage, getConversation, markConversationAsRead } from "@/actions/messages";

export function MessageCenter({ userId, otherUserId, otherUserName }: { userId: string, otherUserId: string, otherUserName: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const loadMessages = async () => {
    try {
      const data = await getConversation(otherUserId);
      setMessages(data.reverse()); // data is desc, we want asc for chat
      await markConversationAsRead(otherUserId);
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [otherUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const msg = await sendMessage({
        recipientId: otherUserId,
        content: newMessage,
      });
      // Optimistically add message
      setMessages([...messages, { ...msg, content: newMessage, senderId: userId, createdAt: new Date() }]);
      setNewMessage("");
    } catch (error) {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-brand-charcoal/40">Loading conversation...</div>;

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-bold uppercase">
            {otherUserName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-brand-black">{otherUserName}</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-wider">Secure Channel</p>
            </div>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/20"
      >
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
               </svg>
            </div>
            <p className="text-sm text-brand-charcoal/40 font-medium">No messages yet. Send a question to our team!</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div 
            key={msg.id || idx}
            className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
              msg.senderId === userId 
                ? "bg-brand-purple text-white rounded-tr-none" 
                : "bg-white border border-gray-100 text-brand-black rounded-tl-none"
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-1.5 font-medium ${
                msg.senderId === userId ? "text-white/60 text-right" : "text-brand-charcoal/30"
              }`}>
                {formatTime(new Date(msg.createdAt))}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all"
          disabled={sending}
        />
        <button 
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="bg-brand-purple text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-brand-purple-dark disabled:opacity-50 transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          {sending ? (
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
