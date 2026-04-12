import * as React from 'react';
import { MessageCircle, Clock, Globe, User } from 'lucide-react';
import Link from 'next/link';

interface CommunityCardProps {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  timeAgo: string;
  sourceLang: string;
  targetLang: string;
  category: string;
  term: string;
  replies: number;
}

export default function CommunityCard({ 
  id, user, timeAgo, sourceLang, targetLang, category, term, replies 
}: CommunityCardProps) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-6 flex flex-col hover:border-[var(--accent)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <User className="h-5 w-5 text-[var(--text-secondary)]" />
          )}
        </div>
        <div>
          <h4 className="text-xs font-bold text-[var(--text-primary)]">{user.name}</h4>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-medium">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
        <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-black text-blue-600">{sourceLang}</span>
            <Globe className="h-3 w-3 text-[var(--text-secondary)]/30" />
            <span className="text-xs uppercase font-black text-indigo-500">{targetLang}</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-[var(--bg-main)] border border-[var(--border)] text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter">
          {category}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-black text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent)] transition-colors leading-tight">
          {term}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] font-bold">
          <MessageCircle className="h-3.5 w-3.5" />
          {replies} {replies === 1 ? 'reply' : 'replies'}
        </div>
      </div>

      <Link 
        href={`/community/questions/${id}`} 
        className="mt-6 w-full py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-main)] text-center text-xs font-black text-[var(--text-primary)] group-hover:bg-[var(--accent)] group-hover:border-transparent group-hover:text-white transition-all shadow-sm"
      >
        View Question
      </Link>
    </div>
  );
}
