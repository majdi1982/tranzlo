"use client"

import React, { useState, useEffect } from "react"
import { Bell, Check, Info, MessageSquare, Briefcase, Star, UserPlus } from "lucide-react"
import { Button } from "@/components/atoms/Button"
import { motion, AnimatePresence } from "framer-motion"
import { getMyNotifications, markAsRead } from "@/services/notifications/actions"
import { useAuth } from "@/hooks/use-auth"
import { Notification } from "@/types"
import { cn } from "@/lib/utils"
import Link from "next/link"

export const NotificationCenter = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    if (!user?.$id) return;
    const res = await getMyNotifications(user.$id)
    if (res.success && res.data) {
      setNotifications(res.data as any)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user?.$id) {
      fetchNotifications()

      const { client, APPWRITE_CONFIG } = require("@/lib/appwrite/config")
      
      const unsubscribe = client.subscribe(
        `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.notificationsCollectionId}.documents`,
        (response: any) => {
          if (response.events.includes("databases.*.collections.*.documents.*.create")) {
            setNotifications((prev) => [response.payload as Notification, ...prev])
          }
          if (response.events.includes("databases.*.collections.*.documents.*.update")) {
            setNotifications((prev) => 
              prev.map(n => n.$id === response.payload.$id ? response.payload as Notification : n)
            )
          }
        }
      )

      return () => unsubscribe()
    }
  }, [user?.$id])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
    setNotifications(notifications.map(n => n.$id === id ? { ...n, read: true } : n))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageSquare className="w-4 h-4 text-blue-400" />
      case "hired": return <Briefcase className="w-4 h-4 text-green-400" />
      case "invitation": return <UserPlus className="w-4 h-4 text-purple-400" />
      case "review": return <Star className="w-4 h-4 text-yellow-400" />
      default: return <Info className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 z-50 w-80 rounded-xl border border-white/[0.05] bg-secondary/90 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/[0.05] flex items-center justify-between">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] text-muted-foreground bg-white/[0.05] px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No notifications yet</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.$id}
                      className={cn(
                        "p-4 border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors cursor-pointer relative",
                        !notification.read && "bg-primary/[0.03]"
                      )}
                      onClick={() => {
                        if (!notification.read) handleMarkAsRead(notification.$id)
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">{getIcon(notification.type)}</div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground mb-1">{notification.content}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                            {notification.link && (
                              <Link 
                                href={notification.link}
                                className="text-[10px] text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View details
                              </Link>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-3 bg-white/[0.02] text-center border-t border-white/[0.05]">
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  View all notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
