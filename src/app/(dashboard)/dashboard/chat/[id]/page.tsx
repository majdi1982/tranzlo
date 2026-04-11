import * as React from 'react';
import { createSessionClient, createAdminClient } from '@/lib/server/appwrite';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { getUserById } from '@/app/actions/users';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const { id } = await params;

  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();
    
    const dbId = process.env.APPWRITE_DATABASE_ID!;
    const convoDoc = await databases.getDocument(dbId, 'conversations', id);

    if (!convoDoc.participants.includes(user.$id)) {
      notFound();
    }

    const otherId = convoDoc.participants.find((p: string) => p !== user.$id);
    const otherUser = otherId ? await getUserById(otherId) : null;

    return (
      <div className="flex flex-col h-[calc(100vh-100px)] py-6 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="mb-4">
          <Link 
            href="/dashboard/chat" 
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Messages
          </Link>
        </div>

        <div className="flex-1">
          <ChatWindow 
            conversationId={id} 
            currentUserId={user.$id} 
            otherUserName={otherUser?.name || 'User'} 
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Chat page error', error);
    notFound();
  }
}
