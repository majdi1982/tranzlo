'use client';

import * as React from 'react';
import Link from 'next/link';
import { getUser, logout } from '@/app/actions/auth';
import { NotificationBell } from './notifications/NotificationBell';
import { LogOut, LayoutDashboard, User, MessageSquarePlus, Settings, Settings2, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function AuthNav() {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
    async function checkUser() {
      try {
        const u = await getUser();
        setUser(u);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
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

  // Determine role for dynamic links
  const role = user.labels?.includes('company') ? 'company' : (user.labels?.includes('admin') ? 'admin' : 'translator');

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Chat */}
      <Link 
        href="/dashboard/chat" 
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
        title="Chat"
      >
        <MessageSquarePlus className="h-4.5 w-4.5" />
      </Link>

      {/* Notifications */}
      <NotificationBell userId={user.$id} />

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
        aria-label="Toggle theme"
      >
        {mounted && theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
      </button>

      {/* User Menu / Profile Dropdown */}
      <div className="relative group ml-1">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--accent)] to-indigo-600 text-white font-bold text-sm shadow-xl border-2 border-[var(--bg-secondary)] group-hover:scale-105 transition-all outline-none">
          {user.name.charAt(0).toUpperCase()}
        </button>
        
        <div className="absolute right-0 mt-3 w-56 hidden group-hover:block animate-in fade-in slide-in-from-top-2 z-50">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] py-2 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* User Header */}
            <div className="px-4 py-3 border-b border-[var(--border)] mb-1 bg-[var(--bg-main)]/50">
              <p className="text-xs font-black text-[var(--text-primary)] truncate uppercase tracking-widest">{user.name}</p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate font-medium">{user.email}</p>
            </div>
            
            <div className="p-1 space-y-0.5">
              <Link 
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--accent)] transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                Community Hub
              </Link>
              
              <Link 
                href={`/dashboard/${role}/profile`}
                className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--accent)] transition-all"
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>

              <Link 
                href={`/dashboard/${role}/profile`}
                className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--accent)] transition-all"
              >
                <Settings2 className="h-4 w-4" />
                Adjust Profile
              </Link>

              <Link 
                href="/dashboard/settings"
                className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-main)] hover:text-[var(--accent)] transition-all"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>

            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-rose-500 hover:bg-rose-50 transition-all border-t border-[var(--border)] mt-1 uppercase tracking-widest"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
