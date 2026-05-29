"use client";

import * as React from "react";
import { UserCheck, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { getServices } from "@/services";
import type { VerificationRequest } from "@/types";

export default function StaffVerificationsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = React.useState<VerificationRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const services = getServices();
      const all = await services.verification.getPendingRequests();
      setRequests(all);
    } catch {
      toast({ title: "Failed to load verification requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(requestId: string) {
    setActionLoading(requestId);
    try {
      const services = getServices();
      await services.verification.approveRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.$id !== requestId));
      toast({ title: "Request approved" });
    } catch {
      toast({ title: "Failed to approve", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(requestId: string) {
    const note = rejectNotes[requestId]?.trim();
    if (!note) {
      toast({ title: "Please provide a reason for rejection", variant: "destructive" });
      return;
    }
    setActionLoading(requestId);
    try {
      const services = getServices();
      await services.verification.rejectRequest(requestId, note);
      setRequests((prev) => prev.filter((r) => r.$id !== requestId));
      toast({ title: "Request rejected" });
    } catch {
      toast({ title: "Failed to reject", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verification Requests</h1>
        <p className="text-muted-foreground">Review and verify user identities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Pending Requests ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No pending verification requests.</p>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-3">
                {requests.map((req) => (
                  <div key={req.$id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="uppercase text-xs">{req.role}</Badge>
                        <span className="text-sm font-medium">{req.userId}</span>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Reason for rejection (required for reject)..."
                        value={rejectNotes[req.$id] || ""}
                        onChange={(e) =>
                          setRejectNotes((prev) => ({ ...prev, [req.$id]: e.target.value }))
                        }
                        className="min-h-[60px] text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => handleApprove(req.$id)}
                          disabled={actionLoading === req.$id}
                        >
                          {actionLoading === req.$id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => handleReject(req.$id)}
                          disabled={actionLoading === req.$id}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
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
