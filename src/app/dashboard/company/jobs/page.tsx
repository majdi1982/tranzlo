"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Briefcase, MoreHorizontal, Globe, MapPin, DollarSign, Calendar, Eye, XCircle, Users, Loader2, CheckCircle2, ExternalLink, FileText, ShieldAlert, ShieldCheck, Lock, Star, User, Languages, Award } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getLanguageName } from "@/data/languages";
import { PayPalButton } from "@/components/paypal-button";
import type { Job } from "@/types";

import { getStorage, BUCKETS, ID } from "@/lib/appwrite";

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
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = React.useState<string>("");
  const [gradingLoading, setGradingLoading] = React.useState<string | null>(null);
  const [feedbackText, setFeedbackText] = React.useState<Record<string, string>>({});
  const [reviewedFiles, setReviewedFiles] = React.useState<Record<string, File | null>>({});
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectDialogApp, setRejectDialogApp] = React.useState<any | null>(null);
  const [profiles, setProfiles] = React.useState<Record<string, any>>({});
  const [selectedProfile, setSelectedProfile] = React.useState<any | null>(null);
  const { toast } = useToast();
  const { user } = useSession();

  async function handleGradeTest(applicationId: string, testStatus: "passed" | "failed") {
    const reviewedFile = reviewedFiles[applicationId];
    if (!reviewedFile) {
      toast({ title: "Reviewed file is required", description: "Please upload the reviewed test file before grading.", variant: "destructive" });
      return;
    }

    setGradingLoading(applicationId);
    try {
      const storage = getStorage();
      const uploaded = await storage.createFile(BUCKETS.TRANSLATOR_DOCUMENTS, ID.unique(), reviewedFile);
      const testReviewedFileUrl = `${storage.client.config.endpoint}/storage/buckets/${BUCKETS.TRANSLATOR_DOCUMENTS}/files/${uploaded.$id}/view?project=${storage.client.config.project}`;

      const services = getServices();
      const app = apps.find(a => a.$id === applicationId);
      if (!app) return;
      const feedback = feedbackText[applicationId] || "";
      const updatePayload: any = {
        testStatus,
        testFeedback: feedback || undefined,
        testReviewedFileUrl,
      };
      if (testStatus === "failed") {
        updatePayload.status = "rejected";
        updatePayload.rejectionReason = feedback || "Failed translation test.";
      }

      await services.application.updateApplicationWithFeedback(applicationId, updatePayload);
      
      await services.notification.createNotification({
        userId: app.translatorId,
        type: "job_updated",
        title: "Test Graded",
        body: `Your test for "${job.title}" has been graded: ${testStatus.toUpperCase()}.`,
        data: { jobId: job.$id },
      });

      setApps((prev) => prev.map((a) => {
        if (a.$id === applicationId) {
          const updatedA = { ...a, testStatus, testFeedback: feedback, testGradedAt: new Date().toISOString() };
          if (testStatus === "failed") {
            updatedA.status = "rejected";
            updatedA.rejectionReason = updatePayload.rejectionReason;
          }
          return updatedA;
        }
        return a;
      }));
      toast({ title: `Test marked as ${testStatus === "passed" ? "Passed" : "Failed"}.`, variant: "success" });
    } catch {
      toast({ title: "Failed to update test status", variant: "destructive" });
    } finally {
      setGradingLoading(null);
    }
  }

  async function handleRejectWithReason(applicationId: string) {
    if (!rejectReason.trim()) {
      toast({ title: "Please provide a rejection reason", variant: "destructive" });
      return;
    }
    try {
      const services = getServices();
      await services.application.updateApplicationWithFeedback(applicationId, {
        status: "rejected",
        rejectionReason: rejectReason.trim(),
      });
      setApps((prev) => prev.map((a) => a.$id === applicationId ? { ...a, status: "rejected", rejectionReason: rejectReason.trim() } : a));
      toast({ title: "Applicant rejected with reason", variant: "success" });
      setRejectDialogApp(null);
      setRejectReason("");
    } catch {
      toast({ title: "Failed to reject applicant", variant: "destructive" });
    }
  }

  async function handleShortlistTranslator(applicationId: string) {
    try {
      const services = getServices();
      if (!user) return;
      const updated = await services.application.inviteToTest(applicationId, job.$id, user.$id);
      setApps((prev) => prev.map((a) => a.$id === applicationId ? { ...a, ...updated } : a));
      toast({ title: "Translator invited to test. Conversation and notification sent.", variant: "success" });
    } catch (error: any) {
      console.error("handleShortlistTranslator error:", error);
      toast({ title: "Failed to invite translator to test", description: error?.message || String(error), variant: "destructive" });
    }
  }

  async function handleSelectTranslator(applicationId: string) {
    try {
      const services = getServices();
      await services.application.selectTranslator(job.$id, applicationId);
      
      // Refresh apps
      const results = await services.application.getApplications(job.$id);
      setApps(results);

      const app = results.find(a => a.$id === applicationId);
      if (app && user) {
        // 1. Create Conversation
        const conv = await services.message.createConversation([user.$id, app.translatorId]);
        
        // 2. Send Initial Welcome Message from Company
        await services.message.sendMessage({
          conversationId: conv.$id,
          senderId: user.$id,
          content: `Hello! You have been selected for the project "${job.title}". Language Pair: ${app.languagePair || 'N/A'}. Let's discuss the details.`,
        });

        // 3. Send Notification to Translator
        await services.notification.createNotification({
          userId: app.translatorId,
          type: "job_hired",
          title: "You're Hired!",
          body: `You have been selected for the project "${job.title}". A new conversation has been started.`,
          data: { jobId: job.$id },
        });
      }

      toast({ title: "Translator selected. Chat opened and others rejected.", variant: "success" });
    } catch {
      toast({ title: "Failed to select translator", variant: "destructive" });
    }
  }

  React.useEffect(() => {
    if (!showApplicants) return;
    async function loadApps() {
      setLoadingApps(true);
      try {
        const services = getServices();
        const results = await services.application.getApplications(job.$id);
        setApps(results);
        
        const profileMap: Record<string, any> = {};
        await Promise.all(
          results.map(async (app) => {
            if (!profileMap[app.translatorId]) {
              try {
                const profile = await services.profile.getTranslatorProfile(app.translatorId);
                if (profile) profileMap[app.translatorId] = profile;
              } catch {}
            }
          })
        );
        setProfiles(profileMap);
      } catch {
        // ignore
      } finally {
        setLoadingApps(false);
      }
    }
    loadApps();
  }, [showApplicants, job.$id]);

  async function handleHiringSuccess(captureId: string) {
    if (!hiringApp || !user) return;
    try {
      const services = getServices();
      // Update status to accepted and set transaction ID
      await services.application.updateApplicationStatus(hiringApp.$id, "accepted");
      
      setApps((prev) =>
        prev.map((a) =>
          a.$id === hiringApp.$id ? { ...a, status: "accepted", financialFileId: captureId } : a
        )
      );

      // 1. Create Conversation
      const conv = await services.message.createConversation([user.$id, hiringApp.translatorId]);
      
      // 2. Send Initial Welcome Message
      let contentStr = `Hello! Escrow deposit of $${hiringApp.bidAmount || job.budget} has been secured for the project "${job.title}". Language Pair: ${hiringApp.languagePair || 'N/A'}. You can now start working.`;
      
      if (job.deadline) {
        contentStr += `\nDeadline: ${new Date(job.deadline).toLocaleDateString()}`;
      }
      
      if (job.translationFileUrl) {
        contentStr += `\n\nHere is the private translation file for this job: ${job.translationFileUrl}`;
      }

      await services.message.sendMessage({
        conversationId: conv.$id,
        senderId: user.$id,
        content: contentStr,
      });

      // 3. Send Notification
      await services.notification.createNotification({
        userId: hiringApp.translatorId,
        type: "job_escrow_funded",
        title: "Escrow Secured & Hired!",
        body: `Escrow for "${job.title}" is funded. Check your new messages to start working.`,
        data: { jobId: job.$id },
      });

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
                {(() => {
                  const srcs = (job.sourceLanguage || "").split(",").map(s => s.trim()).filter(Boolean);
                  const tgts = (job.targetLanguage || "").split(",").map(t => t.trim()).filter(Boolean);
                  return srcs.flatMap(src => tgts.map(tgt => `${getLanguageName(src)} → ${getLanguageName(tgt)}`)).join(" · ");
                })()}
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
                    {new Date().getTime() - new Date(job.createdAt).getTime() <= 60 * 60 * 1000 && (
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/company/jobs/${job.$id}/edit`} className="flex items-center gap-2">
                          <FileText className="h-4 w-4" /> Edit Job
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={() => setShowCloseDialog(true)} className="text-destructive flex items-center gap-2">
                      <XCircle className="h-4 w-4" /> Close Job
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Close this job?</DialogTitle>
                <DialogDescription>
                  This will close "{job.title}" and remove it from public listings.
                  {job.requiresTest && " The test will be distributed to all applicants with a 48-hour deadline."}
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
          </div>
        </div>

        {/* Applicants Sub-Panel */}
        {showApplicants && (
          <div className="mt-5 pt-5 border-t border-border/30 space-y-5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Candidate Proposals Grouped by Language Pair</h4>
            
            {loadingApps ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Loading candidates...</span>
              </div>
            ) : apps.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center">No proposals submitted for this project yet.</p>
            ) : (
              <div className="space-y-6">
                {(() => {
                  const getJobPairs = () => {
                    const targets = job.targetLanguage ? job.targetLanguage.split(",").map(t => t.trim().toUpperCase()) : [];
                    const sources = job.sourceLanguage ? job.sourceLanguage.split(",").map(s => s.trim().toUpperCase()) : [];
                    if (sources.length === 0 || targets.length === 0) {
                      return ["Default Pair"];
                    }
                    const res: string[] = [];
                    sources.forEach(s => {
                      targets.forEach(t => {
                        res.push(`${s} → ${t}`);
                      });
                    });
                    return res;
                  };

                  const jobPairs = getJobPairs();
                  return jobPairs.map((pair) => {
                    const pairApps = apps.filter((app) => {
                      if (!app.languagePair) return true; // fallback
                      const normalizedAppPair = app.languagePair.replace(/\s+/g, "").toUpperCase();
                      const normalizedJobPair = pair.replace(/\s+/g, "").toUpperCase();
                      return normalizedAppPair === normalizedJobPair || normalizedAppPair.includes(normalizedJobPair) || normalizedJobPair.includes(normalizedAppPair);
                    });

                    const activeApp = pairApps.find(a => a.status === "accepted");

                    return (
                      <div key={pair} className="p-4 border border-border/30 rounded-2xl bg-card/20 space-y-4">
                        <div className="flex items-center justify-between border-b border-border/30 pb-2">
                          <span className="text-xs font-bold text-teal-600 bg-teal-500/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                            Language Pair: {pair}
                          </span>
                          {activeApp && (
                            <Badge variant="success" className="text-3xs uppercase font-bold px-2 py-0.5">
                              Active Translator Hired
                            </Badge>
                          )}
                        </div>

                        {pairApps.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2 italic text-center">No proposals submitted for this language pair yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {pairApps.map((app) => {
                              const profile = profiles[app.translatorId];
                              const isActive = app.status === "accepted";
                              
                              return (
                                <div
                                  key={app.$id}
                                  className={`p-4 rounded-xl border border-border/30 bg-accent/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-accent/10 ${
                                    isActive ? "border-teal-500/30 bg-teal-500/[0.02]" : ""
                                  }`}
                                >
                                  <div className="min-w-0 flex-1 space-y-3">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <div
                                        onClick={() => profile && setSelectedProfile(profile)}
                                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity select-none group"
                                      >
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 uppercase border border-primary/20 group-hover:border-primary">
                                          {profile?.fullName?.slice(0, 2) || "TR"}
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                                            {profile?.fullName || `Translator (${app.translatorId.slice(-6).toUpperCase()})`}
                                          </p>
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                                              ★ {profile?.rating || "4.8"}
                                            </span>
                                            <Badge variant="outline" className="text-[9px] py-0 px-1 font-semibold capitalize bg-background">
                                              {profile?.planTier || "Pro"} Member
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <Badge variant={isActive ? "success" : app.status === "rejected" ? "destructive" : "secondary"}>
                                          {app.status}
                                        </Badge>
                                        {job.requiresTest && (
                                          <Badge variant={app.testStatus === "passed" ? "success" : app.testStatus === "failed" ? "destructive" : "warning"} className="font-bold text-[10px]">
                                            Test: {app.testStatus || "pending"}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                      "{app.coverLetter}"
                                    </p>

                                    {/* Test Section */}
                                    {job.requiresTest && app.testSolutionUrl && (
                                      <div className="p-3 rounded-lg border border-border/40 bg-card/40 space-y-2 mt-2">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-cyan-400" />
                                            <span className="text-2xs font-semibold">Test Solution Document</span>
                                          </div>
                                          <div className="flex gap-1.5 items-center">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setPreviewUrl(app.testSolutionUrl!);
                                                setPreviewTitle(`Test Solution - Candidate ${app.translatorId.slice(-6).toUpperCase()}`);
                                              }}
                                              className="p-1 hover:bg-muted text-cyan-400 rounded transition-colors text-2xs flex items-center gap-1 font-semibold"
                                            >
                                              <Eye className="h-3 w-3" />
                                              <span>Preview</span>
                                            </button>
                                            <a href={app.testSolutionUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-muted text-muted-foreground rounded transition-colors">
                                              <ExternalLink className="h-3 w-3" />
                                            </a>
                                          </div>
                                        </div>

                                        {/* 48-Hour SLA Countdown */}
                                        {app.testSubmittedAt && app.testStatus === "pending" && (
                                          (() => {
                                            const remainingHours = Math.max(0, Math.ceil((new Date(app.testSubmittedAt).getTime() + 48 * 60 * 60 * 1000 - Date.now()) / (3600 * 1000)));
                                            const isBreached = remainingHours <= 0;
                                            return (
                                              <div className="flex items-center gap-1.5 text-2xs mt-1">
                                                {isBreached ? (
                                                  <span className="text-rose-500 font-bold flex items-center gap-1">
                                                    <ShieldAlert className="h-3.5 w-3.5" />
                                                    48h Response SLA Breached (احتيال محتمل)
                                                  </span>
                                                ) : (
                                                  <span className="text-amber-500 font-semibold flex items-center gap-1 animate-pulse">
                                                    ⏳ {remainingHours} hours left to respond
                                                  </span>
                                                )}
                                              </div>
                                            );
                                          })()
                                        )}

                                        {/* Test Feedback Textarea */}
                                        {app.testStatus === "pending" && (
                                          <div className="space-y-2 mt-2">
                                            <div className="space-y-1">
                                              <span className="text-2xs font-semibold text-muted-foreground uppercase">Upload Reviewed Test File (Required)</span>
                                              <Input 
                                                type="file" 
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReviewedFiles((prev) => ({ ...prev, [app.$id]: e.target.files?.[0] || null }))}
                                                className="h-8 text-xs"
                                              />
                                            </div>
                                            <textarea
                                              placeholder="Optional feedback on the test solution..."
                                              value={feedbackText[app.$id] || ""}
                                              onChange={(e) => setFeedbackText((prev) => ({ ...prev, [app.$id]: e.target.value }))}
                                              className="w-full text-xs p-2 rounded-md border border-border/30 bg-background resize-none h-16"
                                            />
                                            <div className="flex items-center gap-2 pt-1 border-t border-border/10">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={gradingLoading === app.$id}
                                                onClick={() => handleGradeTest(app.$id, "passed")}
                                                className="h-7 text-3xs font-bold text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 rounded-md py-0 px-2"
                                              >
                                                {gradingLoading === app.$id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                                Pass Test
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={gradingLoading === app.$id}
                                                onClick={() => handleGradeTest(app.$id, "failed")}
                                                className="h-7 text-3xs font-bold text-rose-500 border-rose-500/20 hover:bg-rose-500/10 rounded-md py-0 px-2"
                                              >
                                                {gradingLoading === app.$id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                                Fail Test
                                              </Button>
                                            </div>
                                          </div>
                                        )}

                                        {/* Show test feedback if graded */}
                                        {app.testFeedback && (
                                          <div className="mt-2 p-2 rounded-md bg-muted/20 border border-border/20">
                                            <span className="text-2xs font-semibold text-muted-foreground uppercase">Feedback: </span>
                                            <span className="text-xs text-muted-foreground">{app.testFeedback}</span>
                                          </div>
                                        )}
                                        {app.testReviewedFileUrl && (
                                          <div className="mt-2 flex items-center gap-2">
                                            <span className="text-2xs font-semibold text-muted-foreground uppercase">Reviewed File: </span>
                                            <a href={app.testReviewedFileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1">
                                              <FileText className="h-3 w-3" /> Download
                                            </a>
                                          </div>
                                        )}

                                        {/* Show rejection reason */}
                                        {app.status === "rejected" && app.rejectionReason && (
                                          <div className="mt-2 p-2 rounded-md bg-rose-500/10 border border-rose-500/20">
                                            <span className="text-2xs font-semibold text-rose-600 uppercase">Rejection reason: </span>
                                            <span className="text-xs text-rose-600">{app.rejectionReason}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Hired active translator detailed progress workflow (Diagram mapping) */}
                                    {isActive && (
                                      <div className="p-3 rounded-lg border border-teal-500/20 bg-teal-500/[0.03] space-y-2 mt-2">
                                        <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block">Active Translator Workflow Controls</span>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                          {/* Action 1: Message */}
                                          <Link href="/messages">
                                            <Button size="sm" variant="outline" className="h-8 text-3xs font-bold border-teal-500/20 hover:bg-teal-500/10 text-teal-600 bg-background rounded-md">
                                              💬 Message Translator
                                            </Button>
                                          </Link>

                                          {/* Action 2: Deposit */}
                                          {app.financialFileId ? (
                                            <span className="inline-flex items-center gap-1 text-3xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1.5 rounded-md border border-emerald-500/10 select-none">
                                              💵 Paid / Deposited (${app.bidAmount || job.budget})
                                            </span>
                                          ) : (
                                            <Button
                                              size="sm"
                                              onClick={() => setHiringApp(app)}
                                              className="h-8 text-3xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-md"
                                            >
                                              💳 Escrow Deposit Payout
                                            </Button>
                                          )}

                                          {/* Action 3: Escrow */}
                                          {app.financialFileId ? (
                                            <span className="inline-flex items-center gap-1 text-3xs font-bold text-cyan-600 bg-cyan-500/10 px-2.5 py-1.5 rounded-md border border-cyan-500/10 select-none">
                                              🔒 Platform Escrow Hold ({app.financialFileId.slice(0, 8)})
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 text-3xs font-bold text-muted-foreground bg-accent/40 px-2.5 py-1.5 rounded-md border select-none">
                                              🔒 Escrow Pending
                                            </span>
                                          )}
                                        </div>
                                      </div>
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

                                    {!activeApp && (app.status === "submitted" || app.status === "shortlisted" || app.status === "test_invited") && (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setRejectDialogApp(app)}
                                          className="h-8 rounded-md font-semibold text-xs text-rose-500 border-rose-500/20 hover:bg-rose-500/10"
                                        >
                                          Reject
                                        </Button>
                                        {app.status === "submitted" && (
                                          <Button
                                            size="sm"
                                            onClick={() => handleShortlistTranslator(app.$id)}
                                            className="h-8 rounded-md font-semibold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20"
                                          >
                                            Invite to Test
                                          </Button>
                                        )}
                                        {app.status === "test_invited" && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(`/messages?conversation=${app.conversationId}`, '_blank')}
                                            className="h-8 rounded-md font-semibold text-xs border-blue-500/20 text-blue-600 hover:bg-blue-500/10"
                                          >
                                            View Conversation
                                          </Button>
                                        )}
                                        {app.testStatus === "passed" && (
                                          <Button
                                            size="sm"
                                            onClick={() => handleSelectTranslator(app.$id)}
                                            className="h-8 rounded-md font-semibold text-xs shadow-md shadow-primary/10"
                                          >
                                            Select & Hire
                                          </Button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}

        {/* Reject with Reason Dialog */}
        <Dialog open={!!rejectDialogApp} onOpenChange={(open) => { if (!open) { setRejectDialogApp(null); setRejectReason(""); } }}>
          <DialogContent className="max-w-sm bg-card border border-border/50">
            <DialogHeader>
              <DialogTitle>Reject Applicant</DialogTitle>
              <DialogDescription>Provide a reason for rejecting this applicant. They will see this message.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 my-2">
              <textarea
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-sm p-3 rounded-md border border-border/30 bg-background resize-none h-24"
              />
              <Button
                size="sm"
                variant="destructive"
                disabled={!rejectReason.trim()}
                onClick={() => rejectDialogApp && handleRejectWithReason(rejectDialogApp.$id)}
                className="w-full"
              >
                Reject Applicant
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Unified Approval & Checkout Modal */}
        <Sheet open={!!hiringApp} onOpenChange={(open) => !open && setHiringApp(null)}>
          <SheetContent side="right" className="bg-card border-l border-border/50 max-h-screen overflow-y-auto sm:max-w-xl w-full p-0 shadow-2xl flex flex-col">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-8 border-b border-border/20 sticky top-0 z-20">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-3 text-2xl font-black text-white">
                  <ShieldCheck className="h-8 w-8 text-emerald-400" />
                  Contract Approval & Payment
                </SheetTitle>
                <SheetDescription className="text-base text-slate-300 mt-2 font-medium">
                  Review the translator's proposal and secure the contract via escrow. Funds are held safely until you approve the final delivery.
                </SheetDescription>
              </SheetHeader>
            </div>

            {hiringApp && (
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* 1. Translator Information */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4" /> Translator Profile
                  </h3>
                  {profiles[hiringApp.translatorId] ? (
                    <div className="flex items-start gap-5 p-5 rounded-xl border border-border/40 bg-accent/5">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={profiles[hiringApp.translatorId].avatarUrl} alt={profiles[hiringApp.translatorId].fullName} />
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">{profiles[hiringApp.translatorId].fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-lg">{profiles[hiringApp.translatorId].fullName}</h4>
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                            ★ {profiles[hiringApp.translatorId].rating?.toFixed(1) || "New"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {profiles[hiringApp.translatorId].languages?.map((lang: string) => (
                            <span key={lang} className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground border border-border/50">{lang}</span>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                          <Briefcase className="h-3.5 w-3.5" />
                          {profiles[hiringApp.translatorId].completedJobs} jobs completed
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-xl border border-border/40 bg-accent/5 flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Application Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Application Details
                  </h3>
                  <div className="p-5 rounded-xl border border-border/40 bg-accent/5 space-y-4">
                    <div>
                      <span className="block text-xs text-muted-foreground mb-1.5 font-semibold">Cover Letter</span>
                      <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap bg-background p-4 rounded-lg border border-border/30">
                        {hiringApp.coverLetter || "No cover letter provided."}
                      </p>
                    </div>
                    {job.requiresTest && (
                      <div className="pt-4 border-t border-border/30">
                        <span className="block text-xs text-muted-foreground mb-1.5 font-semibold">Test Evaluation</span>
                        <div className="flex items-center gap-3">
                          <Badge className={hiringApp.testStatus === "passed" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : "bg-muted text-muted-foreground"}>
                            {hiringApp.testStatus === "passed" ? "Passed" : hiringApp.testStatus || "Pending"}
                          </Badge>
                          {hiringApp.testSolutionUrl && (
                            <Link href={hiringApp.testSolutionUrl} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" /> View Submitted Test
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Escrow Summary & Checkout */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Escrow Deposit & Checkout
                  </h3>
                  <div className="p-6 rounded-xl border-2 border-primary/20 bg-primary/5 flex items-center justify-between shadow-inner">
                    <div>
                      <span className="block text-base font-bold text-foreground">Total Escrow Amount</span>
                      <span className="block text-xs text-muted-foreground mt-1">100% Secure & Refundable upon cancellation</span>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-black text-primary">${hiringApp.bidAmount || job.budget}</span>
                      <span className="block text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-wide">Ready to deposit</span>
                    </div>
                  </div>

                  <div className="w-full relative z-10 flex flex-col justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-border/30 shadow-sm mt-6">
                    <div className="flex items-center justify-center gap-2 mb-5">
                      <Lock className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">SSL Encrypted Checkout</span>
                    </div>
                    <div className="min-h-[150px] flex items-center justify-center">
                      <PayPalButton
                        amount={hiringApp.bidAmount || job.budget}
                        applicationId={hiringApp.$id}
                        onSuccess={handleHiringSuccess}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="p-6 border-t border-border/20 bg-muted/20">
              <Button variant="outline" onClick={() => setHiringApp(null)} className="w-full font-semibold border-border/50 hover:bg-muted/50">
                Cancel
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        {/* Document Preview Modal for Companies */}
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
                    <span>عرض الملف / View File</span>
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
                  <p className="text-xs text-muted-foreground">إذا لم يظهر الملف تلقائياً، يمكنك فتحه مباشرة بالضغط على الزر في الأعلى.</p>
                  <p className="text-3xs text-muted-foreground/60">If the document preview doesn't load, use the "View File" button above.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Translator Profile Detail Modal */}
        {selectedProfile && (
          <Sheet open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
            <SheetContent side="right" className="bg-card border-l border-border/50 p-0 overflow-y-auto sm:max-w-lg w-full shadow-2xl">
              <div className="relative h-32 bg-gradient-to-r from-primary/20 to-cyan-500/20 border-b border-border/20">
                <div className="absolute -bottom-10 left-6">
                  <div className="h-20 w-20 rounded-2xl bg-card flex items-center justify-center text-3xl font-black text-primary border-4 border-card shadow-lg ring-1 ring-border/20 uppercase">
                    {selectedProfile.fullName?.slice(0, 2) || "TR"}
                  </div>
                </div>
              </div>
              
              <div className="pt-12 px-6 pb-8 space-y-8">
                <SheetHeader className="text-left space-y-1">
                  <SheetTitle className="text-2xl font-black text-foreground">{selectedProfile.fullName}</SheetTitle>
                  <SheetDescription className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {selectedProfile.rating || "4.8"}
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                      {selectedProfile.completedJobs || 12} Projects
                    </span>
                  </SheetDescription>
                </SheetHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <User className="h-4 w-4" /> Professional Bio
                      </h3>
                      <p className="text-sm text-foreground/90 leading-relaxed p-4 rounded-xl bg-accent/5 border border-border/20 min-h-[120px]">
                        {selectedProfile.bio || "No biography provided. This translator prefers to let their work speak for itself."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Languages className="h-4 w-4" /> Languages
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfile.languages?.length ? selectedProfile.languages.map((lang: string) => (
                          <Badge key={lang} variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            {getLanguageName(lang)}
                          </Badge>
                        )) : <span className="text-xs text-muted-foreground italic">Not specified</span>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Award className="h-4 w-4" /> Specializations
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfile.specializations?.length ? selectedProfile.specializations.map((spec: string) => (
                          <Badge key={spec} variant="outline" className="border-border/40 text-foreground/80 bg-background shadow-sm">
                            {spec}
                          </Badge>
                        )) : <span className="text-xs text-muted-foreground italic">General</span>}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-border/20 pt-4">
                      <div>
                        <span className="text-xs text-muted-foreground block font-semibold uppercase">Hourly Rate</span>
                        <span className="text-sm font-bold text-primary">${selectedProfile.hourlyRate || 30}/hr</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block font-semibold uppercase">Plan Level</span>
                        <span className="text-sm font-bold text-foreground capitalize">{selectedProfile.planTier || "Pro"} Member</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 flex justify-end">
                <Button variant="outline" onClick={() => setSelectedProfile(null)} className="w-full">
                  Close Profile
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </CardContent>
    </Card>
  );
}
