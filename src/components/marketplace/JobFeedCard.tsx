import * as React from 'react';
import { Briefcase, Clock, MapPin, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface JobFeedCardProps {
  id: string;
  title: string;
  sourceLang: string;
  targetLangs: string[];
  budget: string;
  type: string;
  timeAgo: string;
}

export default function JobFeedCard({ 
  id, title, sourceLang, targetLangs, budget, type, timeAgo 
}: JobFeedCardProps) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-6 flex items-center gap-6 hover:border-[var(--accent)] hover:shadow-2xl transition-all duration-300 group">
      <div className="h-14 w-14 rounded-2xl bg-[var(--accent)]/5 flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
        <Briefcase className="h-7 w-7" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-black text-[var(--text-primary)] truncate transition-colors group-hover:text-[var(--accent)]">
            {title}
          </h3>
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-tighter dark:bg-blue-900/30 dark:text-blue-400">
            {type}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-bold">
            <span className="text-[var(--text-primary)] uppercase">{sourceLang}</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-[var(--text-primary)] uppercase">{targetLangs.join(', ')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
             <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
             {budget}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
             <Clock className="h-3.5 w-3.5" />
             {timeAgo}
          </div>
        </div>
      </div>

      <Link 
        href={`/jobs/${id}`} 
        className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--accent)] hover:border-transparent hover:text-white transition-all shadow-sm"
      >
        <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  );
}
