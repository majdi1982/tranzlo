import * as React from 'react';
import { ChatList } from '@/components/chat/ChatList';
import { createSessionClient } from '@/lib/server/appwrite';
import { MessageSquareText } from 'lucide-react';

export default async function ChatPage() {
  const { account } = await createSessionClient().catch(() => ({ account: null as any }));
  const user = account ? await account.get() : null;

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Messages</h1>
          <p className="text-[var(--text-secondary)] mt-2 font-medium">Coordinate with your translation partners in real-time.</p>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shadow-inner">
          <MessageSquareText className="h-7 w-7" />
        </div>
      </div>

      <ChatList currentUserId={user.$id} />
    </div>
  );
}
