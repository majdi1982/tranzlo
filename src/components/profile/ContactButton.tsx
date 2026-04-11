'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createConversation } from '@/app/actions/chat';
import { MessageSquare, Loader2 } from 'lucide-react';

interface Props {
  translatorId: string;
  translatorName: string;
  currentUserId: string;
}

export function ContactButton({ translatorId, translatorName, currentUserId }: Props) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleContact = async () => {
    if (!currentUserId) {
      router.push('/login');
      return;
    }

    setLoading(true);
    const res = await createConversation([currentUserId, translatorId]);
    if (res.success && res.data) {
      router.push(`/dashboard/chat/${res.data.$id}`);
    } else {
      alert('Failed to start conversation: ' + (res.error || 'Unknown error'));
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      className="mt-4 flex items-center justify-center gap-2 w-full rounded-2xl bg-[var(--accent)] py-4 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/20 hover:bg-[var(--hover)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageSquare className="h-4 w-4" />
      )}
      Contact {translatorName.split(' ')[0]}
    </button>
  );
}
