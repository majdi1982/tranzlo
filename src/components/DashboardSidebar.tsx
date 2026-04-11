'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  User, 
  Settings,
  PlusCircle,
  Search,
  Zap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardSidebarProps {
  role: 'translator' | 'company' | 'admin';
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();

  const links = React.useMemo(() => {
    const common = [
      { name: 'Dashboard', href: `/dashboard/${role}`, icon: LayoutDashboard },
      { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
      { name: 'Profile', href: `/dashboard/${role}/profile`, icon: User },
    ];

    if (role === 'translator') {
      return [
        ...common,
        { name: 'Find Jobs', href: '/jobs', icon: Search },
      ];
    }

    if (role === 'company') {
      return [
        ...common,
        { name: 'My Jobs', href: '/dashboard/company/jobs', icon: Briefcase },
        { name: 'Post Job', href: '/dashboard/company/jobs/new', icon: PlusCircle },
      ];
    }

    return common;
  }, [role]);

  return (
    <>
      {/* ─── Desktop Sidebar ────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r border-[var(--border)] bg-[var(--bg-secondary)] p-6 z-30 transition-all">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Tranzlo</span>
        </div>

        <nav className="flex-1 space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  isActive 
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--hover)]/10 hover:text-[var(--text-primary)]"
                )}
              >
                <link.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-[var(--text-secondary)]")} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[var(--border)] pt-6">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-main)] transition-all"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </div>
      </aside>

      {/* ─── Mobile Bottom Nav ──────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-t border-[var(--border)] px-6 pb-4 pt-3 z-50 flex items-center justify-around shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                isActive ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl transition-all",
                isActive && "bg-[var(--accent)]/10"
              )}>
                <link.icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{link.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Spacer for desktop content to not go under fixed sidebar */}
      <div className="hidden md:block w-64 shrink-0" />
    </>
  );
}
