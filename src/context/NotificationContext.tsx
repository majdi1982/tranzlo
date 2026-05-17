import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import client, { APPWRITE_CONFIG } from '../lib/appwrite';
import { NotificationService } from '../lib/services/notificationService';
import { 
  Bell, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  MessageSquare, 
  CreditCard,
  Globe
} from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'message' | 'payment' | 'broadcast' | 'dispute' | 'success';
  duration?: number;
}

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type: ToastMessage['type'], duration?: number) => void;
  dismissToast: (id: string) => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotif: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const showToast = (title: string, message: string, type: ToastMessage['type'], duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, title, message, type, duration };
    setToasts(prev => [newToast, ...prev]);

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshNotifications = async () => {
    if (!user) return;
    const list = await NotificationService.getUserNotifications(user.$id);
    setNotifications(list);
  };

  const markRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    setNotifications(prev => 
      prev.map(n => n.$id === id ? { ...n, read: true } : n)
    );
  };

  const markAllRead = async () => {
    if (!user) return;
    await NotificationService.markAllAsRead(user.$id);
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    showToast('Success', 'All notifications marked as read', 'success');
  };

  const deleteNotif = async (id: string) => {
    await NotificationService.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.$id !== id));
  };

  // Sync notifications when user changes
  useEffect(() => {
    if (user) {
      refreshNotifications();

      // Subscribe to Appwrite Realtime channel for notifications
      const channel = `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.notifications}.documents`;
      
      const unsubscribe = client.subscribe(channel, (response: any) => {
        const { events, payload } = response;
        
        // Ensure payload is for the current user
        if (payload.userId !== user.$id) return;

        if (events.some((e: string) => e.endsWith('.create'))) {
          // Add to notifications state
          setNotifications(prev => [payload, ...prev]);
          
          // Trigger a beautiful floating real-time toast notification!
          showToast(
            payload.title || 'New Notification', 
            payload.message || 'You received a new notification.', 
            payload.type || 'system'
          );
        } else if (events.some((e: string) => e.endsWith('.update'))) {
          setNotifications(prev => 
            prev.map(n => n.$id === payload.$id ? payload : n)
          );
        } else if (events.some((e: string) => e.endsWith('.delete'))) {
          setNotifications(prev => prev.filter(n => n.$id !== payload.$id));
        }
      });

      return () => {
        unsubscribe();
      };
    } else {
      setNotifications([]);
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toasts,
      showToast,
      dismissToast,
      markRead,
      markAllRead,
      deleteNotif,
      refreshNotifications
    }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(toast => {
          // Vibrant style configuration based on type
          const config = {
            success: {
              border: 'border-emerald-500/30',
              bg: 'bg-emerald-950/80',
              badge: 'bg-emerald-500 text-emerald-950',
              icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
              glow: 'shadow-emerald-500/10'
            },
            system: {
              border: 'border-blue-500/30',
              bg: 'bg-blue-950/80',
              badge: 'bg-blue-500 text-blue-950',
              icon: <Info className="w-5 h-5 text-blue-400" />,
              glow: 'shadow-blue-500/10'
            },
            message: {
              border: 'border-indigo-500/30',
              bg: 'bg-indigo-950/80',
              badge: 'bg-indigo-500 text-indigo-950',
              icon: <MessageSquare className="w-5 h-5 text-indigo-400" />,
              glow: 'shadow-indigo-500/10'
            },
            payment: {
              border: 'border-amber-500/30',
              bg: 'bg-amber-950/80',
              badge: 'bg-amber-500 text-amber-950',
              icon: <CreditCard className="w-5 h-5 text-amber-400" />,
              glow: 'shadow-amber-500/10'
            },
            dispute: {
              border: 'border-rose-500/30',
              bg: 'bg-rose-950/80',
              badge: 'bg-rose-500 text-rose-950',
              icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
              glow: 'shadow-rose-500/10'
            },
            broadcast: {
              border: 'border-purple-500/30',
              bg: 'bg-purple-950/80',
              badge: 'bg-purple-500 text-purple-950',
              icon: <Globe className="w-5 h-5 text-purple-400" />,
              glow: 'shadow-purple-500/10'
            }
          }[toast.type] || {
            border: 'border-white/10',
            bg: 'bg-slate-900/90',
            badge: 'bg-slate-500 text-white',
            icon: <Bell className="w-5 h-5 text-slate-400" />,
            glow: 'shadow-slate-500/5'
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-full flex items-start gap-4 p-5 rounded-3xl border ${config.border} ${config.bg} backdrop-blur-xl shadow-2xl ${config.glow} transition-all duration-300 transform translate-y-0 animate-in slide-in-from-bottom duration-300 relative group overflow-hidden`}
              style={{ contentVisibility: 'auto' }}
            >
              {/* Pulsing Light Glow Effect */}
              <div className="absolute -left-10 -top-10 w-24 h-24 bg-white/5 blur-2xl rounded-full group-hover:scale-150 transition-all duration-500" />
              
              <div className={`p-2.5 rounded-2xl flex items-center justify-center shrink-0`}>
                {config.icon}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white tracking-wide">{toast.title}</h4>
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 px-2 py-0.5 bg-white/5 rounded-full font-semibold">
                    {toast.type}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{toast.message}</p>
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all self-start shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
