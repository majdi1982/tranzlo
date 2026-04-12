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
      {/* Action Row - Control Center */}
      <div className="flex items-center gap-1.5 sm:gap-2 mr-2 border-r border-[var(--border)] pr-2 sm:pr-4">
        {/* Chat */}
        <Link 
          href="/dashboard/chat" 
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:shadow-lg transition-all group"
          title="Direct Messages"
        >
          <MessageSquarePlus className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </Link>

        {/* Notifications */}
        <div className="relative">
          <NotificationBell userId={user.$id} />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all group"
          aria-label="Toggle theme"
        >
          {mounted && theme === 'dark' ? (
            <Sun className="h-5 w-5 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="h-5 w-5 group-hover:-rotate-12 transition-transform" />
          )}
        </button>
      </div>

      {/* User Menu / Profile Dropdown */}
      <div className="relative group">
        <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-sm shadow-xl border-4 border-[var(--bg-secondary)] group-hover:scale-105 group-hover:rotate-3 transition-all outline-none">
          {user.name.charAt(0).toUpperCase()}
        </button>
        
        {/* Dropdown 2.0 */}
        <div className="absolute right-0 mt-4 w-64 hidden group-hover:block animate-in fade-in slide-in-from-top-3 z-[60]">
          <div className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--bg-secondary)]/95 p-2 shadow-2xl backdrop-blur-3xl overflow-hidden ring-1 ring-black/5">
            
            {/* 1. Identity Layer */}
            <div className="px-5 py-5 mb-1 bg-gradient-to-br from-[var(--bg-main)] to-transparent rounded-[2rem] border border-[var(--border)]/50">
              <div className="flex items-center gap-3 mb-3">
                 <div className="h-10 w-10 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white font-black">
                   {user.name.charAt(0).toUpperCase()}
                 </div>
                 <div className="min-w-0">
                   <p className="text-sm font-black text-[var(--text-primary)] truncate tracking-tighter">{user.name}</p>
                   <p className="text-[10px] text-[var(--text-secondary)] truncate font-bold uppercase tracking-widest">{role}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Now</span>
              </div>
            </div>
            
            {/* 2. Platform Navigation */}
            <div className="p-1 space-y-1">
              <Link 
                href="/dashboard"
                className="flex items-center justify-between px-4 py-3 text-xs font-black text-[var(--text-secondary)] rounded-2xl hover:bg-[var(--accent)] hover:text-white transition-all group/link"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="h-4.5 w-4.5" />
                  Community Hub
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </Link>
              
              <Link 
                href={`/dashboard/${role === 'admin' ? 'admin' : (role === 'company' ? 'company' : 'translator')}/profile`}
                className="flex items-center justify-between px-4 py-3 text-xs font-black text-[var(--text-secondary)] rounded-2xl hover:bg-[var(--accent)] hover:text-white transition-all group/link"
              >
                <div className="flex items-center gap-3">
                  <User className="h-4.5 w-4.5" />
                  My Public Profile
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </Link>

              <Link 
                href="/dashboard/settings"
                className="flex items-center justify-between px-4 py-3 text-xs font-black text-[var(--text-secondary)] rounded-2xl hover:bg-[var(--accent)] hover:text-white transition-all group/link"
              >
                <div className="flex items-center gap-3">
                  <Settings2 className="h-4.5 w-4.5" />
                  Edit Settings
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </Link>
            </div>

            {/* 3. Account Actions */}
            <div className="mt-1 pt-1 border-t border-[var(--border)]">
              <button 
                onClick={async () => {
                   await logout();
                   window.location.href = '/';
                }}
                className="w-full flex items-center gap-4 px-5 py-4 text-xs font-black text-rose-500 hover:bg-rose-500/10 transition-all rounded-2xl group/out"
              >
                <LogOut className="h-4.5 w-4.5 group-hover/out:translate-x-1 transition-transform" />
                Sign out of Tranzlo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}
