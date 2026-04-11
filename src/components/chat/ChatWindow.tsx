'use client';

import * as React from 'react';
import client from '@/lib/appwrite';
import { sendMessage, getMessages, type ChatMessage } from '@/app/actions/chat';
import { Send, Loader2, User, Clock } from 'lucide-react';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '69da165d00335f7a350e';

interface Props {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
}

export function ChatWindow({ conversationId, currentUserId, otherUserName }: Props) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Initial History
  React.useEffect(() => {
    async function loadHistory() {
      const history = await getMessages(conversationId);
      setMessages(history as any); // Cast to any because of $createdAt vs createdAt nuances in types
      setLoading(false);
    }
    loadHistory();
  }, [conversationId]);

  // Real-time listener
  React.useEffect(() => {
    const unsubscribe = client.subscribe(
      `databases.${DB_ID}.collections.messages.documents`,
      (response) => {
        const doc = response.payload as any;
        if (doc.conversationId !== conversationId) return;

        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          setMessages((prev) => {
            // Avoid duplicates if the message was added locally first
            if (prev.find(m => m.$id === doc.$id)) return prev;
            return [...prev, doc];
          });
        }
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  // Scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const content = input;
    setInput('');

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      $id: tempId,
      conversationId,
      senderId: currentUserId,
      senderName: 'You',
      text: content,
      $createdAt: new Date().toISOString()
    } as any;

    setMessages(prev => [...prev, optimisticMsg]);

    const res = await sendMessage(conversationId, content);
    if (!res.success) {
      setMessages(prev => prev.filter(m => m.$id !== tempId));
      alert('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-[var(--bg-main)] p-6 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold">
            {otherUserName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-[var(--text-primary)]">{otherUserName}</h2>
            <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Now
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--text-secondary)]">
            <div className="h-20 w-20 rounded-full bg-[var(--bg-main)] flex items-center justify-center mb-6">
              <User className="h-8 w-8 text-[var(--accent)]/30" />
            </div>
            <p className="text-sm font-bold">Start a professional conversation</p>
            <p className="text-xs mt-1">Discuss job details, deadlines, and requirements.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div 
                key={msg.$id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] rounded-3xl px-6 py-4 shadow-sm relative group
                  ${isMe 
                    ? 'bg-[var(--accent)] text-white' 
                    : 'bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border)]'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-2 text-[10px] 
                    ${isMe ? 'text-white/70' : 'text-[var(--text-secondary)]/70'}`}
                  >
                    <Clock className="h-3 w-3" />
                    {new Date(msg.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-6 bg-[var(--bg-main)] border-t border-[var(--border)]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] px-6 py-4 pr-16 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20 hover:bg-[var(--hover)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
