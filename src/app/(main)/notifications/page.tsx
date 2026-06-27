"use client";

import * as React from "react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { Bell, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { user } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadNotifs() {
      if (!user?.$id) return;
      try {
        const services = getServices();
        const notifs = await services.notification.getNotifications(user.$id);
        setNotifications(notifs);
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifs();
  }, [user?.$id]);

  const handleNotificationClick = async (notif: any) => {
    try {
      const services = getServices();
      if (!notif.read) {
        await services.notification.markAsRead(notif.$id);
        setNotifications((prev) => 
          prev.map((n) => (n.$id === notif.$id ? { ...n, read: true } : n))
        );
      }
      
      let targetUrl = null;
      if (notif.data) {
        try {
          const parsed = JSON.parse(notif.data);
          if (parsed.jobId) targetUrl = `/jobs/${parsed.jobId}`;
          else if (parsed.url) targetUrl = parsed.url;
        } catch {
          // ignore
        }
      }

      if (targetUrl) {
        router.push(targetUrl);
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const services = getServices();
      const unread = notifications.filter((n) => !n.read);
      for (const notif of unread) {
        await services.notification.markAsRead(notif.$id);
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return (
    <AuthGuard>
      <div className="container max-w-4xl py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-1">Stay updated with your latest activity and alerts.</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead} 
            disabled={loading || notifications.every((n) => n.read)}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Bell className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-lg font-medium text-foreground">No notifications</p>
                <p>You don't have any notifications yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {notifications.map((notif) => (
                  <div
                    key={notif.$id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "p-5 cursor-pointer transition-colors flex items-start gap-4",
                      !notif.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="mt-1 shrink-0">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        !notif.read ? "bg-primary" : "bg-transparent"
                      )} />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <p className={cn("text-sm font-semibold break-words", !notif.read ? "text-foreground" : "text-muted-foreground")}>
                          {notif.title}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                          {new Date(notif.createdAt || notif.$createdAt).toLocaleString(undefined, { 
                            dateStyle: "medium", 
                            timeStyle: "short" 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground break-words">{notif.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
