'use client';

import { useState, useEffect } from 'react';
import client from '@/lib/appwrite';
import { getNotifications, markAsRead, type Notification } from '@/app/actions/notifications';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '69da165d00335f7a350e';
const COLLECTION_ID = 'notifications';

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    if (!userId) return;

    async function fetchInitial() {
      if (!userId) return;
      const res = await getNotifications(userId);
      if (res) {
        setNotifications(res as any[]);
        setUnreadCount((res as any[]).filter(n => !n.read).length);
      }
      setLoading(false);
    }

    fetchInitial();
  }, [userId]);

  // Real-time listener
  useEffect(() => {
    if (!userId) return;

    // Listen for events in the notifications collection
    const unsubscribe = client.subscribe(
      `databases.${DB_ID}.collections.${COLLECTION_ID}.documents`,
      (response) => {
        const doc = response.payload as any;

        // Verify this document belongs to the current user
        if (doc.userId !== userId) return;

        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          setNotifications(prev => [doc, ...prev].slice(0, 15));
          setUnreadCount(prev => prev + 1);
          
          // Optional: Browser Notification / Toast
          if ('Notification' in window && Notification.permission === 'granted') {
             new Notification(doc.title, { body: doc.message });
          }
        }

        if (response.events.includes('databases.*.collections.*.documents.*.update')) {
          setNotifications(prev => 
            prev.map(n => n.$id === doc.$id ? { ...n, read: doc.read } : n)
          );
          if (doc.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const readNotification = async (id: string) => {
    const success = await markAsRead(id);
    if (success) {
      setNotifications(prev => prev.map(n => n.$id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  return { 
    notifications, 
    unreadCount, 
    loading, 
    readNotification 
  };
}
