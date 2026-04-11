'use client';

import * as React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellDot, Check, Info, Briefcase, CreditCard, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface Props {
  userId: string;
}

export function NotificationBell({ userId }: Props) {
  const { notifications, unreadCount, readNotification } = useNotifications(userId);
  const [isOpen, setIsOpen] = React.useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job': return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'payment': return <CreditCard className="h-4 w-4 text-emerald-500" />;
      case 'message': return <MessageCircle className="h-4 w-4 text-indigo-500" />;
      default: return <Info className="h-4 w-4 text-[var(--text-secondary)]" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)]/10 transition-all relative"
      >
        {unreadCount > 0 ? (
          <>
            <BellDot className="h-5 w-5 text-[var(--accent)]" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-white shadow-sm animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        ) : (
          <Bell className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-3 w-80 max-h-[480px] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="divide-y divide-[var(--border)]">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div 
                    key={n.$id} 
                    className={`group relative flex gap-3 p-4 transition-colors hover:bg-[var(--bg-main)]/50 ${!n.read ? 'bg-[var(--accent)]/[0.03]' : ''}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-main)] border border-[var(--border)] shadow-sm">
                        {getTypeIcon(n.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className={`text-sm font-semibold text-[var(--text-primary)] ${!n.read ? 'pr-2' : ''}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-2">
                        {n.message}
                      </p>
                      <p className="mt-2 text-[10px] text-[var(--text-secondary)]/60 font-medium">
                        {new Date(n.$createdAt).toLocaleDateString()}
                      </p>
                      {n.link && (
                        <Link 
                          href={n.link} 
                          className="mt-2 inline-block text-[10px] font-bold text-[var(--accent)] hover:underline"
                          onClick={() => setIsOpen(false)}
                        >
                          View details →
                        </Link>
                      )}
                    </div>
                    {!n.read && (
                      <button 
                        onClick={() => readNotification(n.$id)}
                        className="absolute top-4 right-4 h-5 w-5 rounded-full flex items-center justify-center text-[var(--text-secondary)]/40 hover:text-emerald-500 hover:bg-emerald-50 transition-all opacity-0 group-hover:opacity-100"
                        title="Mark as read"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-main)] mb-4">
                    <Bell className="h-6 w-6 text-[var(--text-secondary)]/30" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">No notifications yet</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">We&apos;ll notify you when something important happens.</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t border-[var(--border)] p-3 text-center">
                <button className="text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest">
                  View all activity
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
