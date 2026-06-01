"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Briefcase, MoreHorizontal, Globe, MapPin, DollarSign, Calendar, Eye, XCircle, Users, Loader2, CheckCircle2 } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getLanguageName } from "@/data/languages";
import { PayPalButton } from "@/components/paypal-button";
import type { Job } from "@/types";

const statusBadge: Record<string, "default" | "secondary" | "success" | "warning" | "outline"> = {
  open: "success",
  filled: "secondary",
  closed: "outline",
  cancelled: "outline",
};

export default function CompanyJobsPage() {
  const { user } = useSession();
  const { toast } = useToast();
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [closingId, setClosingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const services = getServices();
        const myJobs = await services.job.getJobs({ companyId: user?.$id });
        setJobs(myJobs);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.$id]);

  async function closeJob(jobId: string) {
    setClosingId(jobId);
    try {
      const services = getServices();
      await services.job.closeJob(jobId);
      setJobs((prev) => prev.map((j) => (j.$id === jobId ? { ...j, status: "closed" as const } : j)));
      toast({ title: "Job closed", variant: "success" });
    } catch {
      toast({ title: "Failed to close job", variant: "destructive" });
    } finally {
      setClosingId(null);
    }
  }

  const openJobs = jobs.filter((j) => j.status === "open");
  const otherJobs = jobs.filter((j) => j.status !== "open");

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["company"]}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Jobs</h1>
              <p className="text-muted-foreground">Manage your translation projects</p>
            </div>
            <Link href="/dashboard/company/post">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Post a Job
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-16 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No jobs yet</h3>
              <p className="text-sm text-muted-foreground">Post your first translation project to get started.</p>
              <Link href="/dashboard/company/post">
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" /> Post a Job
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {openJobs.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Active Jobs ({openJobs.length})</h2>
                  <div className="space-y-3">
                    {openJobs.map((job) => (
                      <JobCard key={job.$id} job={job} onClose={closeJob} closingId={closingId} />
                    ))}
                  </div>
                </div>
              )}

              {otherJobs.length > 0 && (
                <div>
                  <Separator className="my-6" />
                  <h2 className="text-lg font-semibold mb-3">Past Jobs ({otherJobs.length})</h2>
                  <div className="space-y-3">
                    {otherJobs.map((job) => (
                      <JobCard key={job.$id} job={job} onClose={closeJob} closingId={closingId} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}

function JobCard({
  job,
  onClose,
  closingId,
}: {
  job: Job;
  onClose: (id: string) => void;
  closingId: string | null;
}) {
  const [showCloseDialog, setShowCloseDialog] = React.useState(false);
  const [showApplicants, setShowApplicants] = React.useState(false);
  const [apps, setApps] = React.useState<any[]>([]);
  const [loadingApps, setLoadingApps] = React.useState(false);
  const [hiringApp, setHiringApp] = React.useState<any | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!showApplicants) return;
    async function loadApps() {
      setLoadingApps(true);
      try {
        const services = getServices();
        const results = await services.application.getApplications(job.$id);
        setApps(results);
      } catch {
        // ignore
      } finally {
        setLoadingApps(false);
      }
    }
    loadApps();
  }, [showApplicants, job.$id]);

  async function handleHiringSuccess(captureId: string) {
    if (!hiringApp) return;
    try {
      const services = getServices();
      // Update status to accepted and set transaction ID
      await services.application.updateApplicationStatus(hiringApp.$id, "accepted");
      
      setApps((prev) =>
        prev.map((a) =>
          a.$id === hiringApp.$id ? { ...a, status: "accepted", financialFileId: captureId } : a
        )
      );
      toast({ title: "Contract secured and translator hired successfully!", variant: "success" });
      setHiringApp(null);
    } catch {
      toast({ title: "Hiring update failed. Please contact support.", variant: "destructive" });
    }
  }

  return (
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{job.title}</h3>
              <Badge variant={statusBadge[job.status] || "outline"} className="shrink-0">
                {job.status}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {getLanguageName(job.sourceLanguage)} → {getLanguageName(job.targetLanguage)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.workType === "online" ? "Remote" : job.country ?? "On-site"}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />${job.budget}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(job.deadline).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApplicants(!showApplicants)}
              className="gap-1 rounded-md h-9 text-xs"
            >
              <Users className="h-3.5 w-3.5" />
              {showApplicants ? "Hide Applicants" : "Applicants"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/jobs/${job.$id}`} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" /> View Job Detail
                  </Link>
                </DropdownMenuItem>
                {job.status === "open" && (
                  <>
                    <DropdownMenuItem onSelect={() => setShowCloseDialog(true)} className="text-destructive flex items-center gap-2">
                      <XCircle className="h-4 w-4" /> Close Job
                    </DropdownMenuItem>
                    <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Close this job?</DialogTitle>
                          <DialogDescription>
                            This will close "{job.title}" and remove it from public listings.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowCloseDialog(false)}>Cancel</Button>
                          <Button
                            variant="destructive"
                            disabled={closingId === job.$id}
                            onClick={() => {
                              onClose(job.$id);
                              setShowCloseDialog(false);
                            }}
                          >
                            Close Job
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Applicants Sub-Panel */}
        {showApplicants && (
          <div className="mt-5 pt-5 border-t border-border/30 space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Candidate Proposals</h4>
            
            {loadingApps ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Loading candidates...</span>
              </div>
            ) : apps.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">No proposals submitted for this project yet.</p>
            ) : (
              <div className="space-y-3">
                {apps.map((app) => (
                  <div
                    key={app.$id}
                    className="p-4 rounded-xl border border-border/30 bg-accent/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-accent/10"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">Candidate ID: {app.translatorId.slice(-6).toUpperCase()}</span>
                        <Badge variant={app.status === "accepted" ? "success" : app.status === "rejected" ? "destructive" : "secondary"}>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        "{app.coverLetter}"
                      </p>
                      {app.financialFileId && (
                        <p className="text-3xs text-emerald-500 font-semibold mt-1">
                          Escrow Secured: {app.financialFileId}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                      <div className="text-right">
                        <span className="text-sm font-bold text-primary flex items-center justify-end">
                          <DollarSign className="h-3.5 w-3.5" />
                          {app.bidAmount || job.budget}
                        </span>
                        <span className="text-3xs text-muted-foreground uppercase font-semibold">Proposed Bid</span>
                      </div>

                      {app.status === "submitted" && (
                        <Button
                          size="sm"
                          onClick={() => setHiringApp(app)}
                          className="h-8 rounded-md font-semibold text-xs shadow-md shadow-primary/10"
                        >
                          Hire & Pay
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Secure PayPal Checkout Modal */}
        <Dialog open={!!hiringApp} onOpenChange={(open) => !open && setHiringApp(null)}>
          <DialogContent className="max-w-md bg-card border border-border/50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Secure Contract Escrow
              </DialogTitle>
              <DialogDescription>
                Deposit funds securely using PayPal. The funds will be held in platform escrow until translator delivery.
              </DialogDescription>
            </DialogHeader>

            {hiringApp && (
              <div className="space-y-4 my-4">
                <div className="p-4 rounded-xl bg-accent/10 border border-border/30 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Contract Target:</span>
                    <span className="font-semibold text-foreground">{job.title}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Linguist ID:</span>
                    <span className="font-semibold text-foreground">{hiringApp.translatorId.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-border/20 pt-2 font-bold text-sm">
                    <span className="text-foreground">Total Escrow Hold:</span>
                    <span className="text-primary">${hiringApp.bidAmount || job.budget} USD</span>
                  </div>
                </div>

                <PayPalButton
                  amount={hiringApp.bidAmount || job.budget}
                  applicationId={hiringApp.$id}
                  onSuccess={handleHiringSuccess}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setHiringApp(null)} className="w-full">
                Cancel Checkout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
