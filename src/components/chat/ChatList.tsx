'use client';

import * as React from 'react';
import { listConversations, type Conversation } from '@/app/actions/chat';
import { getUserById } from '@/app/actions/users';
import Link from 'next/link';
import { MessageSquare, Clock, ArrowRight } from 'lucide-react';

interface Props {
  currentUserId: string;
}

export function ChatList({ currentUserId }: Props) {
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadConv() {
      const convos = await listConversations();
      
      // We need to fetch names of other participants
      const detailed = await Promise.all(convos.map(async (c) => {
        const otherId = c.participants.find((p: string) => p !== currentUserId);
        const otherUser = otherId ? await getUserById(otherId) : null;
        return { ...c, otherUser };
      }));

      setConversations(detailed);
      setLoading(false);
    }
    loadConv();
  }, [currentUserId]);

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 w-full animate-pulse rounded-3xl bg-[var(--bg-secondary)]" />
      ))}
    </div>
  );

  if (conversations.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl text-center p-8">
      <div className="h-16 w-16 rounded-full bg-[var(--bg-main)] flex items-center justify-center mb-6">
        <MessageSquare className="h-6 w-6 text-[var(--text-secondary)]/30" />
      </div>
      <h3 className="text-lg font-bold text-[var(--text-primary)]">No conversations yet</h3>
      <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xs mx-auto">
        When a company or translator starts a conversation about a job, it will appear here.
      </p>
      <Link 
        href="/jobs" 
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/20 hover:scale-[1.02] transition-all"
      >
        Browse Jobs
      </Link>
    </div>
  );

  return (
    <div className="space-y-4">
      {conversations.map((c) => (
        <Link 
          key={c.$id}
          href={`/dashboard/chat/${c.$id}`}
          className="group flex items-center gap-6 p-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl transition-all hover:bg-[var(--bg-main)] hover:border-[var(--accent)] hover:shadow-xl hover:shadow-[var(--accent)]/5"
        >
          <div className="h-14 w-14 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
            {c.otherUser?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--text-primary)] truncate">
                {c.otherUser?.name || 'Unknown User'}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Clock className="h-3.5 w-3.5" />
                {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString() : 'No activity'}
              </div>
            </div>
            <p className="mt-1 text-sm text-[var(--text-secondary)] truncate">
              {c.lastMessage || 'Start a conversation...'}
            </p>
          </div>

          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-transparent border border-[var(--border)] group-hover:bg-[var(--accent)] group-hover:border-transparent group-hover:text-white transition-all text-[var(--text-secondary)]">
            <ArrowRight className="h-5 w-5" />
          </div>
        </Link>
      ))}
    </div>
  );
}
