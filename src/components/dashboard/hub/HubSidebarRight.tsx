'use client';

import * as React from 'react';
import { BarChart3, Star, ExternalLink, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function HubSidebarRight() {
  return (
    <div className="flex flex-col gap-6">
      {/* Quick Poll */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-[var(--accent)]">
          <BarChart3 className="h-4 w-4" />
          <h3 className="text-xs font-black uppercase tracking-widest">Quick Community Poll</h3>
        </div>
        <p className="text-sm font-bold text-[var(--text-primary)] mb-6">Are you using AI to assist in your translation workflow?</p>
        
        <div className="space-y-3">
          {['Yes, for every project', 'Only for first drafts', 'Rarely', 'Never'].map((option) => (
            <button key={option} className="w-full text-left p-3 rounded-xl border border-[var(--border)] text-[11px] font-bold text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--bg-main)] transition-all">
              {option}
            </button>
          ))}
        </div>
        <button className="mt-6 text-[10px] font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase tracking-tighter w-full text-center">
          View all results
        </button>
      </div>

      {/* Featured Businesses */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
        <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-6">Featured Businesses</h3>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 group cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-xs font-black text-[var(--text-secondary)]">
                 L{i}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">Global Solutions Ltd.</h4>
                <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                  <Star className="h-3 w-3 fill-amber-500" />
                  4.9
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-[var(--text-secondary)]/30 group-hover:text-[var(--accent)]" />
            </div>
          ))}
        </div>
        <Link href="/companies" className="mt-8 block text-center py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-white hover:border-transparent transition-all">
          Explore Directory
        </Link>
      </div>

      {/* Blog Snippet */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
        <MessageSquare className="h-6 w-6 mb-4 opacity-50" />
        <h4 className="text-sm font-black mb-2 leading-tight">New Industry Report: The State of Localization 2026</h4>
        <p className="text-[10px] text-blue-100 font-medium opacity-80 mb-6">Discover the trends and technologies shaping the future of translation.</p>
        <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:gap-4 transition-all">
          Read More <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
