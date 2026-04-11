'use client';

import * as React from 'react';
import Link from 'next/link';
import { getUser, logout } from '@/app/actions/auth';
import { NotificationBell } from './notifications/NotificationBell';
import { LogOut, LayoutDashboard, User } from 'lucide-react';

export function AuthNav() {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function checkUser() {
      const u = await getUser();
      setUser(u);
      setLoading(false);
    }
    checkUser();
  }, []);

  if (loading) return <div className="h-9 w-24 animate-pulse rounded-full bg-[var(--bg-main)]" />;

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link 
          href="/login"
          className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--hover)] hover:shadow-md transition-all duration-300"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Notifications */}
      <NotificationBell userId={user.$id} />

      {/* User Menu / Dropdown Placeholder */}
      <div className="relative group">
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-white font-bold text-xs shadow-sm group-hover:shadow-md transition-all">
          {user.name.charAt(0).toUpperCase()}
        </button>
        
        <div className="absolute right-0 mt-3 w-48 hidden group-hover:block animate-in fade-in slide-in-from-top-2 z-50">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] py-2 shadow-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-[var(--border)] mb-1">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user.name}</p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate">{user.email}</p>
            </div>
            
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-main)] hover:text-[var(--accent)] transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              My Dashboard
            </Link>
            
            <Link 
              href="/dashboard/translator/profile" // Dynamic based on role would be better but this is a shortcut
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-main)] hover:text-[var(--accent)] transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              My Profile
            </Link>

            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-[var(--border)] mt-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
