"use client";

import * as React from "react";
import { Send, Bell, Users, Search, AlertCircle, CheckCircle2, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface SentNotificationLog {
  $id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  userEmail?: string;
  userName?: string;
}

export default function AdminNotificationsPage() {
  const [recipientType, setRecipientType] = React.useState<"all" | "translators" | "companies" | "specific">("all");
  const [targetIdentifier, setTargetIdentifier] = React.useState("");
  const [notifType, setNotifType] = React.useState("system");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [inAppEnabled, setInAppEnabled] = React.useState(true);
  const [emailEnabled, setEmailEnabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");

  const [history, setHistory] = React.useState<SentNotificationLog[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState(true);

  // Load sent notification history
  const loadHistory = React.useCallback(async () => {
    try {
      setLoadingHistory(true);
      const db = (await import("@/lib/appwrite")).getDatabases();
      const { DB_ID, COLLECTIONS } = await import("@/lib/appwrite");
      
      const res = await db.listDocuments(DB_ID, COLLECTIONS.notifications, [
        // Load latest 10 notifications
        (await import("@/lib/appwrite")).Query.orderDesc("$createdAt"),
        (await import("@/lib/appwrite")).Query.limit(10)
      ]);

      const list: SentNotificationLog[] = [];
      for (const doc of res.documents) {
        let uEmail = "";
        let uName = "";

        // Resolve user name / email where possible
        try {
          const transDocs = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [
            (await import("@/lib/appwrite")).Query.equal("userId", doc.userId),
            (await import("@/lib/appwrite")).Query.limit(1)
          ]);
          if (transDocs.documents.length > 0) {
            uEmail = transDocs.documents[0].email || transDocs.documents[0].emailAddress || "";
            uName = transDocs.documents[0].fullName || "";
          } else {
            const compDocs = await db.listDocuments(DB_ID, COLLECTIONS.companyProfiles, [
              (await import("@/lib/appwrite")).Query.equal("userId", doc.userId),
              (await import("@/lib/appwrite")).Query.limit(1)
            ]);
            if (compDocs.documents.length > 0) {
              uEmail = compDocs.documents[0].email || compDocs.documents[0].emailAddress || "";
              uName = compDocs.documents[0].companyName || "";
            }
          }
        } catch {}

        list.push({
          $id: doc.$id,
          userId: doc.userId,
          type: doc.type,
          title: doc.title,
          body: doc.body,
          createdAt: doc.createdAt,
          userEmail: uEmail,
          userName: uName
        });
      }

      setHistory(list);
    } catch (err: any) {
      console.error("Failed to load notification history:", err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setErrorMsg("Please fill out both the title and body of the notification.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const db = (await import("@/lib/appwrite")).getDatabases();
      const { DB_ID, COLLECTIONS } = await import("@/lib/appwrite");
      const { Query } = await import("@/lib/appwrite");

      let targetUserIds: string[] = [];

      if (recipientType === "specific") {
        if (!targetIdentifier.trim()) {
          throw new Error("Please provide a User ID or Email address.");
        }
        // Try searching translators first by email or userId
        let userFound = false;
        const transDocs = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [
          Query.or([
            Query.equal("userId", targetIdentifier.trim()),
            Query.equal("email", targetIdentifier.trim())
          ]),
          Query.limit(1)
        ]);

        if (transDocs.documents.length > 0) {
          targetUserIds.push(transDocs.documents[0].userId);
          userFound = true;
        } else {
          // Try searching companies
          const compDocs = await db.listDocuments(DB_ID, COLLECTIONS.companyProfiles, [
            Query.or([
              Query.equal("userId", targetIdentifier.trim()),
              Query.equal("email", targetIdentifier.trim())
            ]),
            Query.limit(1)
          ]);
          if (compDocs.documents.length > 0) {
            targetUserIds.push(compDocs.documents[0].userId);
            userFound = true;
          }
        }

        if (!userFound) {
          // Assume it's a raw userId if no profile match
          targetUserIds.push(targetIdentifier.trim());
        }
      } else if (recipientType === "translators") {
        const trans = await db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [Query.limit(100)]);
        targetUserIds = trans.documents.map((d) => d.userId);
      } else if (recipientType === "companies") {
        const comps = await db.listDocuments(DB_ID, COLLECTIONS.companyProfiles, [Query.limit(100)]);
        targetUserIds = comps.documents.map((d) => d.userId);
      } else {
        // All users (combination of both)
        const [trans, comps] = await Promise.all([
          db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles, [Query.limit(100)]),
          db.listDocuments(DB_ID, COLLECTIONS.companyProfiles, [Query.limit(100)])
        ]);
        const set = new Set<string>();
        trans.documents.forEach((d) => set.add(d.userId));
        comps.documents.forEach((d) => set.add(d.userId));
        targetUserIds = Array.from(set);
      }

      if (targetUserIds.length === 0) {
        throw new Error("No target users found for the selected recipient option.");
      }

      // Create notification documents
      let count = 0;
      for (const uId of targetUserIds) {
        const docId = `notif_${Math.random().toString(36).substring(2, 11)}`;
        await db.createDocument(DB_ID, COLLECTIONS.notifications, docId, {
          userId: uId,
          type: notifType,
          title,
          body,
          read: false,
          createdAt: new Date().toISOString(),
          data: JSON.stringify({ emailEnabled, inAppEnabled })
        });
        count++;
      }

      setSuccessMsg(`Successfully queued and sent ${count} notifications (in-app and emails dispatch started).`);
      setTitle("");
      setBody("");
      setTargetIdentifier("");
      
      // Reload history
      setTimeout(() => {
        loadHistory();
      }, 1000);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to broadcast notifications.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-background via-accent/5 to-background p-6 md:p-8">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Notification System Dispatcher</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gradient bg-gradient-to-r from-primary via-cyan-400 to-primary mt-2">
              Broadcast Center
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
              Broadcast critical notifications, account warnings, welcome letters, or subscription updates to users via both in-app inbox and HTML emails.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sending Form */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden shadow-md lg:col-span-2">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Send className="h-4.5 w-4.5 text-primary" />
              Compose Broadcast
            </CardTitle>
            <CardDescription className="text-2xs">Send a direct message or alert to users</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSend} className="space-y-5">
              {successMsg && (
                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Recipient Target</label>
                  <select
                    value={recipientType}
                    onChange={(e) => setRecipientType(e.target.value as any)}
                    className="w-full bg-background border border-border/60 hover:border-border rounded-lg p-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">All Registered Users</option>
                    <option value="translators">Translators Only</option>
                    <option value="companies">Companies Only</option>
                    <option value="specific">Specific User (Email / User ID)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1.5 block">Notification Type / Theme</label>
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value)}
                    className="w-full bg-background border border-border/60 hover:border-border rounded-lg p-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="system">System (Blue Theme)</option>
                    <option value="welcome">Welcome (Green Theme)</option>
                    <option value="verification_approved">Verification Approved (Green Theme)</option>
                    <option value="verification_rejected">Verification Rejected (Amber Theme)</option>
                    <option value="trial_ending">Trial Ending (Amber Theme)</option>
                    <option value="upgrade_required">Upgrade Required (Amber Theme)</option>
                    <option value="subscription_updated">Subscription Updated (Cyan Theme)</option>
                    <option value="subscription_expired">Subscription Expired (Red Theme)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 items-center p-3.5 rounded-lg border border-border/40 bg-accent/5">
                <span className="text-xs font-bold text-muted-foreground mr-1 uppercase tracking-wider">Channels:</span>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-foreground/80 hover:text-foreground select-none">
                  <input
                    type="checkbox"
                    checked={inAppEnabled}
                    onChange={(e) => setInAppEnabled(e.target.checked)}
                    className="rounded border-border bg-background text-primary focus:ring-primary/20 h-4 w-4 transition"
                  />
                  In-App Notification
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-foreground/80 hover:text-foreground select-none">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    className="rounded border-border bg-background text-primary focus:ring-primary/20 h-4 w-4 transition"
                  />
                  Send HTML Email
                </label>
              </div>

              {recipientType === "specific" && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-xs font-medium mb-1.5 block">User Identifier</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter user email or User ID (e.g. user@domain.com or NOTIF_123)"
                      value={targetIdentifier}
                      onChange={(e) => setTargetIdentifier(e.target.value)}
                      className="pl-9 bg-background/50"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium mb-1.5 block">Notification Title</label>
                <Input
                  placeholder="Enter a descriptive title for the notification"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/50"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block">Message Body</label>
                <Textarea
                  placeholder="Type the message contents here. Users will receive this both inside their dashboard inbox and as an HTML email."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[140px] bg-background/50 leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading} className="gap-2 rounded-lg font-medium shadow-md shadow-primary/20">
                  {loading ? "Broadcasting..." : "Dispatch Broadcast"}
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* History Log */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden shadow-md">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-primary" />
              Broadcast History
            </CardTitle>
            <CardDescription className="text-2xs">Latest notification logs in system</CardDescription>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/20 max-h-[500px] overflow-y-auto">
            {loadingHistory ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No notifications logged yet.
              </div>
            ) : (
              history.map((logItem) => (
                <div key={logItem.$id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-2xs font-semibold rounded-md border-primary/20 bg-primary/5 uppercase">
                      {logItem.type}
                    </Badge>
                    <span className="text-3xs text-muted-foreground">
                      {new Date(logItem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-xs">{logItem.title}</h4>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed text-2xs">{logItem.body}</p>
                  </div>
                  <div className="text-3xs text-muted-foreground flex items-center gap-1.5 pt-1">
                    <Users className="h-3 w-3" />
                    <span>
                      {logItem.userName ? `${logItem.userName} (${logItem.userEmail})` : `User: ${logItem.userId}`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
