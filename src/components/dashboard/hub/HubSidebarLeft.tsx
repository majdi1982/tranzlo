'use client';

import * as React from 'react';
import { User, Shield, MapPin, Calendar, Star, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

interface HubSidebarLeftProps {
  user: {
    name: string;
    role: string;
    location?: string;
    memberSince: string;
    rating?: number;
    avatar?: string;
  };
}

export default function HubSidebarLeft({ user }: HubSidebarLeftProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Profile Card */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
           <Link href="/dashboard/settings"><Settings className="h-4 w-4" /></Link>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-2xl bg-[var(--accent)]/10 border-2 border-[var(--accent)]/20 flex items-center justify-center mb-4 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
             {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
             ) : (
                <User className="h-10 w-10 text-[var(--accent)]" />
             )}
          </div>
          <h3 className="text-lg font-black text-[var(--text-primary)] font-outfit">{user.name}</h3>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-black uppercase tracking-widest mt-2">
            <Shield className="h-3 w-3" />
            {user.role} Member
          </div>
        </div>

        <div className="mt-8 space-y-4 pt-8 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-secondary)]">
            <MapPin className="h-4 w-4 text-[var(--accent)]" />
            {user.location || 'Location not set'}
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-secondary)]">
            <Calendar className="h-4 w-4 text-[var(--accent)]" />
            Member since {user.memberSince}
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-secondary)]">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            Rating: {user.rating || 'N/A'}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-4 overflow-hidden">
         <Link href={`/dashboard/${user.role === 'company' ? 'company' : 'translator'}/profile`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[var(--bg-main)] transition-all text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)]">
            <User className="h-4 w-4" />
            My Public Profile
         </Link>
         <Link href="/dashboard/chat" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[var(--bg-main)] transition-all text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--accent)]">
            <Shield className="h-4 w-4" />
            Security & Trust
         </Link>
         <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all text-sm font-bold text-[var(--text-secondary)]">
            <LogOut className="h-4 w-4" />
            Log Out
         </button>
      </div>
    </div>
  );
}
