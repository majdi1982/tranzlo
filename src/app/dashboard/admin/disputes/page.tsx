"use client";

import * as React from "react";
import { Scale, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getServices } from "@/services";
import type { Dispute } from "@/types";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "destructive",
  pending: "secondary",
  resolved: "default",
  rejected: "outline",
};

const decisionLabels: Record<string, string> = {
  release: "Release Payment",
  refund: "Refund Client",
  dismiss: "Dismiss Dispute",
};

export default function AdminDisputesPage() {
  const { toast } = useToast();
  const [disputes, setDisputes] = React.useState<Dispute[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [resolveTarget, setResolveTarget] = React.useState<Dispute | null>(null);
  const [decision, setDecision] = React.useState<"release" | "refund" | "dismiss">("release");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    loadDisputes();
  }, []);

  async function loadDisputes() {
    try {
      const services = getServices();
      const all = await services.dispute.getDisputes();
      setDisputes(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      toast({ title: "Failed to load disputes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve() {
    if (!resolveTarget) return;
    if (!note.trim()) {
      toast({ title: "Please provide a decision note", variant: "destructive" });
      return;
    }
    setActionLoading(resolveTarget.$id);
    try {
      const services = getServices();
      await services.dispute.resolve(resolveTarget.$id, decision, note.trim());
      setDisputes((prev) => prev.filter((d) => d.$id !== resolveTarget.$id));
      toast({ title: `Dispute resolved: ${decisionLabels[decision]}` });
      setResolveTarget(null);
      setNote("");
    } catch {
      toast({ title: "Failed to resolve dispute", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Disputes</h1>
        <p className="text-muted-foreground">Resolve job payment disputes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5" />
            All Disputes ({disputes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : disputes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No disputes found.</p>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-3">
                {disputes.map((d) => (
                  <div key={d.$id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Dispute #{d.$id.slice(-6)}</h3>
                        <span className="text-xs text-muted-foreground">Job: {d.jobId}</span>
                      </div>
                      <Badge variant={statusVariant[d.status] || "outline"}>{d.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Raised by: {d.raisedById}</p>
                    <p className="text-sm mb-2">{d.reason}</p>
                    {d.decision && (
                      <div className="rounded-lg bg-muted p-2 mb-2">
                        <p className="text-xs font-medium">Decision: {decisionLabels[d.decision] || d.decision}</p>
                        {d.adminDecisionNote && <p className="text-xs text-muted-foreground mt-1">{d.adminDecisionNote}</p>}
                      </div>
                    )}
                    {d.status === "open" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => { setResolveTarget(d); setDecision("release"); setNote(""); }}>
                            <Scale className="h-4 w-4" /> Resolve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resolve Dispute</DialogTitle>
                            <DialogDescription>Choose a resolution for this dispute.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="flex gap-2">
                              {(["release", "refund", "dismiss"] as const).map((opt) => (
                                <Button
                                  key={opt}
                                  variant={decision === opt ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setDecision(opt)}
                                  className="flex-1"
                                >
                                  {decisionLabels[opt]}
                                </Button>
                              ))}
                            </div>
                            <Textarea
                              placeholder="Decision note..."
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              className="min-h-[80px]"
                            />
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setResolveTarget(null)}>Cancel</Button>
                            <Button onClick={handleResolve} disabled={actionLoading === resolveTarget?.$id}>
                              {actionLoading === resolveTarget?.$id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Resolve
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
