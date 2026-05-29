"use client";

import * as React from "react";
import { Shield, MessageSquareReply, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { getServices } from "@/services";
import type { Complaint } from "@/types";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "destructive",
  resolved: "default",
  rejected: "secondary",
};

export default function StaffComplaintsPage() {
  const { toast } = useToast();
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [replies, setReplies] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    try {
      const services = getServices();
      const all = await services.complaint.getAllComplaints();
      setComplaints(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      toast({ title: "Failed to load complaints", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleReply(complaintId: string, resolve?: boolean) {
    const reply = replies[complaintId]?.trim();
    if (!reply) {
      toast({ title: "Please write a reply", variant: "destructive" });
      return;
    }
    setActionLoading(complaintId);
    try {
      const services = getServices();
      await services.complaint.reply(complaintId, reply, resolve);
      setComplaints((prev) => prev.filter((c) => c.$id !== complaintId));
      toast({ title: resolve ? "Complaint resolved" : "Reply sent" });
    } catch {
      toast({ title: "Failed to send reply", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Complaints</h1>
        <p className="text-muted-foreground">Manage user complaints</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            All Complaints ({complaints.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No complaints found.</p>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-3">
                {complaints.map((c) => (
                  <div key={c.$id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold">{c.subject}</h3>
                      <Badge variant={statusVariant[c.status] || "outline"}>
                        {c.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">User: {c.userId}</p>
                    <p className="text-sm mb-3">{c.description}</p>
                    {c.adminReply && (
                      <div className="mb-3 rounded-lg bg-muted p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Your reply:</p>
                        <p className="text-sm">{c.adminReply}</p>
                      </div>
                    )}
                    {c.status === "open" && (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Write your reply..."
                          value={replies[c.$id] || ""}
                          onChange={(e) =>
                            setReplies((prev) => ({ ...prev, [c.$id]: e.target.value }))
                          }
                          className="min-h-[60px] text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="gap-1"
                            onClick={() => handleReply(c.$id, false)}
                            disabled={actionLoading === c.$id}
                          >
                            {actionLoading === c.$id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MessageSquareReply className="h-4 w-4" />
                            )}
                            Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1"
                            onClick={() => handleReply(c.$id, true)}
                            disabled={actionLoading === c.$id}
                          >
                            <Shield className="h-4 w-4" />
                            Reply & Resolve
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
