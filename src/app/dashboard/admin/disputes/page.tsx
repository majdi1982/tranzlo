"use client";

import * as React from "react";
import { Scale, Loader2, CheckCircle, XCircle, ExternalLink, FileText, ShieldAlert, Eye } from "lucide-react";
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
import type { Dispute, Job, Application } from "@/types";

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

interface DisputeWithDetails extends Dispute {
  job?: Job | null;
  applications?: Application[];
}

export default function AdminDisputesPage() {
  const { toast } = useToast();
  const [disputes, setDisputes] = React.useState<DisputeWithDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [resolveTarget, setResolveTarget] = React.useState<DisputeWithDetails | null>(null);
  const [decision, setDecision] = React.useState<"release" | "refund" | "dismiss">("release");
  const [note, setNote] = React.useState("");
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = React.useState<string>("");

  React.useEffect(() => {
    loadDisputes();
  }, []);

  async function loadDisputes() {
    try {
      const services = getServices();
      const all = await services.dispute.getDisputes();
      
      const enriched = await Promise.all(all.map(async (d) => {
        let job = null;
        let applications: Application[] = [];
        try {
          job = await services.job.getJob(d.jobId);
          if (job) {
            applications = await services.application.getApplications(d.jobId);
          }
        } catch (e) {
          console.error("Error loading dispute details:", e);
        }
        return {
          ...d,
          job,
          applications,
        };
      }));

      setDisputes(enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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
      
      // Auto-Release Funds & Place Rating Logic
      if (decision === "release" && resolveTarget.job) {
        // Find the translator app
        const translatorId = resolveTarget.job.activeTranslatorId || resolveTarget.raisedById;
        const companyId = resolveTarget.job.companyId;
        const app = resolveTarget.applications?.find((a) => a.translatorId === translatorId);
        
        if (app && translatorId) {
          // 1. Accept delivery (transfers funds to translator)
          await services.application.acceptDelivery(
            resolveTarget.jobId,
            app.$id,
            translatorId,
            app.bidAmount || resolveTarget.job.budget,
            companyId
          );
          
          // 2. Automatically grant "Very Good" (4 stars) rating
          await (services as any).rating.create({
            jobId: resolveTarget.jobId,
            fromUserId: companyId, // Looks like company rated them
            toUserId: translatorId,
            stars: 4,
            reviewText: "System automatically assigned a Very Good rating following a dispute resolution in favor of the translator.",
          });
        }
      }

      setDisputes((prev) => prev.filter((d) => d.$id !== resolveTarget.$id));
      toast({ title: `Dispute resolved: ${decisionLabels[decision]}` });
      setResolveTarget(null);
      setNote("");
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to resolve dispute", variant: "destructive", description: e.message });
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

                    {/* Recruitment Test & Dispute Analytics */}
                    {(() => {
                      const apps = d.applications || [];
                      const job = d.job;
                      
                      // 1. Company Fraud Risk
                      const passedTests = apps.filter(a => a.testStatus === "passed");
                      const passedAndRejected = passedTests.filter(a => a.status === "rejected");
                      const fraudRiskPercent = passedTests.length > 0 ? Math.round((passedAndRejected.length / passedTests.length) * 100) : 0;
                      
                      // 2. Translator Favorability Score
                      let favorabilityScore = 50;
                      const transApp = apps.find(a => a.translatorId === d.raisedById);
                      
                      const reasons: string[] = [];
                      if (transApp) {
                        if (transApp.testStatus === "passed") {
                          favorabilityScore += 10;
                          reasons.push("+10% Passed test");
                        }
                        if (transApp.testStatus === "passed" && transApp.status === "rejected") {
                          favorabilityScore += 25;
                          reasons.push("+25% Passed test but rejected");
                        }
                        if (transApp.testSubmittedAt) {
                          const submitted = new Date(transApp.testSubmittedAt).getTime();
                          const graded = transApp.testGradedAt ? new Date(transApp.testGradedAt).getTime() : Date.now();
                          if (graded - submitted > 48 * 3600 * 1000) {
                            favorabilityScore += 15;
                            reasons.push("+15% Company exceeded 48h SLA response");
                          }
                        }
                      }
                      if (job?.testWordCount && job.testWordCount > 250) {
                        favorabilityScore += 10;
                        reasons.push("+10% Test exceeded 250 words limit");
                      }
                      favorabilityScore = Math.min(100, favorabilityScore);
                      
                      return (
                        <div className="my-3 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border border-border/20">
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Company Fraud Risk Index</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-sm font-extrabold ${fraudRiskPercent > 50 ? 'text-rose-500' : fraudRiskPercent > 20 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {fraudRiskPercent}%
                              </span>
                              <span className="text-3xs text-muted-foreground">({passedAndRejected.length}/{passedTests.length} tests rejected)</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Translator Favorability Score</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-extrabold text-cyan-400">
                                {favorabilityScore}%
                              </span>
                              {reasons.length > 0 && (
                                <span className="text-[9px] text-muted-foreground leading-none">
                                  ({reasons.join(", ")})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {d.justifications && (
                      <div className="mt-2 text-xs text-muted-foreground bg-card/60 p-2.5 rounded-lg border border-border/30">
                        <span className="font-bold text-foreground block text-[10px] uppercase">Translator Justifications</span>
                        <p className="mt-1 leading-relaxed">"{d.justifications}"</p>
                      </div>
                    )}
                    
                    {d.evidenceFiles && d.evidenceFiles.length > 0 && (
                      <div className="mt-2 space-y-1.5 mb-3">
                        <span className="font-bold text-foreground block text-[10px] uppercase">Dispute Evidence Documents</span>
                        <div className="flex flex-wrap gap-2">
                          {d.evidenceFiles.map((fileUrl, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border/40 bg-card/40 text-2xs">
                              <FileText className="h-3.5 w-3.5 text-cyan-400" />
                              <span className="font-semibold text-muted-foreground">Evidence #{idx + 1}</span>
                              <div className="flex gap-1.5 items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewUrl(fileUrl);
                                    setPreviewTitle(`Dispute Evidence #${idx + 1} - Dispute #${d.$id.slice(-6)}`);
                                  }}
                                  className="p-0.5 hover:bg-muted text-cyan-400 rounded transition-colors"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="p-0.5 hover:bg-muted text-muted-foreground rounded transition-colors">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
      {/* Document Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl h-[85vh] bg-card border border-border/50 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{previewTitle}</h3>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 text-2xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>View File</span>
                </a>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setPreviewTitle("");
                }}
                className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 w-full h-full bg-black/10 rounded-xl overflow-hidden relative flex flex-col items-center justify-center">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0 absolute inset-0 z-10"
                title={previewTitle}
              />
              <div className="text-center p-6 space-y-3 z-0">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto animate-pulse" />
                <p className="text-xs text-muted-foreground">If the document preview doesn't load, use the "View File" button above.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
