"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, MessageCircle, FileText, ShieldAlert, ShieldCheck, Lock, Star, User, Languages, Award, Loader2, CheckCircle2, ExternalLink, XCircle, DollarSign, MapPin, Globe, Calendar, Users, Eye } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { toast } = useToast();

  const [job, setJob] = React.useState<Job | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [apps, setApps] = React.useState<any[]>([]);
  const [loadingApps, setLoadingApps] = React.useState(true);
  const [profiles, setProfiles] = React.useState<Record<string, any>>({});

  // Action states
  const [hiringApp, setHiringApp] = React.useState<any | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = React.useState<string>("");
  const [gradingLoading, setGradingLoading] = React.useState<string | null>(null);
  const [feedbackText, setFeedbackText] = React.useState<Record<string, string>>({});
  const [reviewedFiles, setReviewedFiles] = React.useState<Record<string, File | null>>({});
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectDialogApp, setRejectDialogApp] = React.useState<any | null>(null);
  const [selectedProfile, setSelectedProfile] = React.useState<any | null>(null);
  const [disputeApp, setDisputeApp] = React.useState<any | null>(null);
  const [disputeReasonText, setDisputeReasonText] = React.useState("");
  const [submittingDisputeApp, setSubmittingDisputeApp] = React.useState<string | null>(null);
  const [rejectTranslationApp, setRejectTranslationApp] = React.useState<any | null>(null);
  const [revisionFeedbackText, setRevisionFeedbackText] = React.useState("");
  const [revisionFile, setRevisionFile] = React.useState<File | null>(null);
  const [submittingRevision, setSubmittingRevision] = React.useState(false);

  React.useEffect(() => {
    if (!params?.id) return;
    async function loadData() {
      try {
        const services = getServices();
        const j = await services.job.getJob(params.id);
        if (!j) {
          setLoading(false);
          setLoadingApps(false);
          return;
        }
        setJob(j);

        const results = await services.application.getApplications(j.$id);
        
        // Auto-approve deliveries older than 48h
        let updatedResults = [...results];
        const now = Date.now();
        for (let i = 0; i < updatedResults.length; i++) {
          const app = updatedResults[i];
          if (app.status === "accepted" && app.deliveryDate && app.escrowStatus !== "disputed") {
            const deliveredAt = new Date(app.deliveryDate).getTime();
            const hoursSince = (now - deliveredAt) / (1000 * 60 * 60);
            if (hoursSince > 48) {
              try {
                // Auto-approve
                await services.application.acceptDelivery(j.$id, app.$id, app.translatorId, app.bidAmount || j.budget, j.companyId);
                updatedResults[i] = { ...app, status: "completed", escrowStatus: "released" };
                toast({ title: "Delivery Auto-Approved", description: "48 hours passed since delivery without action.", variant: "success" });
              } catch (err) {
                console.error("Auto-approve failed", err);
              }
            }
          }
        }
        setApps(updatedResults);
        
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
        toast({ title: "Failed to load job details", variant: "destructive" });
      } finally {
        setLoading(false);
        setLoadingApps(false);
      }
    }
    loadData();
  }, [params?.id]);

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
        body: `Your test for "${job?.title}" has been graded: ${testStatus.toUpperCase()}.`,
        data: { jobId: job?.$id },
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
      if (!user || !job) return;
      const updated = await services.application.inviteToTest(applicationId, job.$id, user.$id);
      setApps((prev) => prev.map((a) => a.$id === applicationId ? { ...a, ...updated } : a));
      toast({ title: "Translator invited to test. Conversation and notification sent.", variant: "success" });
    } catch (error: any) {
      console.error("handleShortlistTranslator error:", error);
      toast({ title: "Failed to invite translator to test", description: error?.message || String(error), variant: "destructive" });
    }
  }

  async function handleExtensionAction(applicationId: string, action: "approved" | "rejected") {
    try {
      const services = getServices();
      await services.application.updateApplicationWithFeedback(applicationId, {
        extensionStatus: action,
      });

      const app = apps.find(a => a.$id === applicationId);
      if (app && job) {
        await services.notification.createNotification({
          userId: app.translatorId,
          type: "job_updated",
          title: `Extension ${action === "approved" ? "Approved" : "Rejected"}`,
          body: `Your request for a deadline extension for "${job.title}" has been ${action}.`,
          data: { jobId: job.$id },
        });
      }

      setApps(prev => prev.map(a => a.$id === applicationId ? { ...a, extensionStatus: action } : a));
      toast({ title: "Success", description: `Extension ${action} successfully.` });
    } catch {
      toast({ title: "Error", description: "Failed to process extension request.", variant: "destructive" });
    }
  }

  async function handleSelectTranslator(applicationId: string) {
    try {
      const services = getServices();
      if (!job || !user) return;
      await services.application.selectTranslator(job.$id, applicationId);
      
      const results = await services.application.getApplications(job.$id);
      setApps(results);

      const app = results.find(a => a.$id === applicationId);
      if (app) {
        const conv = await services.message.createConversation([user.$id, app.translatorId], job.$id);
        await services.message.sendMessage({
          conversationId: conv.$id,
          senderId: user.$id,
          content: `Hello! You have been selected for the project "${job.title}". Language Pair: ${app.languagePair || 'N/A'}. Let's discuss the details.`,
        });

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

  async function handleFileDispute(app: any) {
    if (disputeReasonText.trim().length < 20) {
      toast({ title: "Reason too short", description: "Minimum 20 characters.", variant: "destructive" });
      return;
    }

    setSubmittingDisputeApp(app.$id);
    try {
      const services = getServices();
      if (!job) return;
      const dispute = await services.dispute.create({
        jobId: app.jobId,
        reason: disputeReasonText.trim(),
        raisedById: user?.$id || "",
      });

      await services.application.updateApplicationWithFeedback(app.$id, {
        escrowStatus: "disputed",
        disputeId: dispute.$id,
      });

      setApps((prev) => prev.map((a) => a.$id === app.$id ? { ...a, escrowStatus: "disputed" as const, disputeId: dispute.$id } : a));

      await services.notification.createNotification({
        userId: app.translatorId,
        type: "dispute_update",
        title: "Dispute Opened",
        body: `The client has opened a dispute for "${job.title}".`,
        data: { jobId: job.$id, disputeId: dispute.$id },
      });

      toast({ title: "Dispute Filed", variant: "success" });
      setDisputeApp(null);
      setDisputeReasonText("");
    } catch (err: any) {
      toast({ title: "Failed to submit dispute", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingDisputeApp(null);
    }
  }

  async function handleRejectTranslation(app: any) {
    if (!revisionFile || !revisionFeedbackText.trim()) {
      toast({ title: "File and Feedback Required", variant: "destructive" });
      return;
    }

    setSubmittingRevision(true);
    try {
      const storage = getStorage();
      if (!job) return;
      const uploaded = await storage.createFile(BUCKETS.TRANSLATOR_DOCUMENTS, ID.unique(), revisionFile);
      const fileUrl = `${storage.client.config.endpoint}/storage/buckets/${BUCKETS.TRANSLATOR_DOCUMENTS}/files/${uploaded.$id}/view?project=${storage.client.config.project}`;

      const services = getServices();
      await services.application.updateApplicationWithFeedback(app.$id, {
        revisionStatus: "requested",
        revisionReason: revisionFeedbackText.trim(),
        revisionReviewedFileUrl: fileUrl,
        deliveryFileUrl: "", 
        deliveryDate: "",
      });

      setApps((prev) => prev.map((a) => a.$id === app.$id ? { ...a, revisionStatus: "requested" as const, revisionReason: revisionFeedbackText.trim(), revisionReviewedFileUrl: fileUrl, deliveryFileUrl: undefined, deliveryDate: undefined } : a));

      await services.notification.createNotification({
        userId: app.translatorId,
        type: "job_updated",
        title: "Revision Requested",
        body: `The client requested a revision for "${job.title}".`,
        data: { jobId: job.$id },
      });

      toast({ title: "Revision Requested Successfully", variant: "success" });
      setRejectTranslationApp(null);
      setRevisionFeedbackText("");
      setRevisionFile(null);
    } catch (err: any) {
      toast({ title: "Failed to Send Revision Request", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingRevision(false);
    }
  }

  async function handleAcceptDelivery(applicationId: string, translatorId: string, baseValue: number) {
    try {
      const services = getServices();
      if (!job || !user) return;
      await services.application.acceptDelivery(job.$id, applicationId, translatorId, baseValue, user.$id);
      
      setApps((prev) => prev.map((a) => a.$id === applicationId ? { ...a, status: "completed", escrowStatus: "released" } : a));
      toast({ title: "Delivery Accepted & Payment Released", variant: "success" });
    } catch (err: any) {
      toast({ title: "Failed to accept delivery", description: err.message, variant: "destructive" });
    }
  }

  async function handleHiringSuccess(captureId: string) {
    if (!hiringApp || !user || !job) return;
    try {
      const services = getServices();
      await services.application.updateApplicationStatus(hiringApp.$id, "accepted");
      await services.application.fundEscrow(job.$id, user.$id, hiringApp.bidAmount || job.budget, captureId);
      
      setApps((prev) => prev.map((a) => a.$id === hiringApp.$id ? { ...a, status: "accepted", financialFileId: captureId, escrowStatus: "funded" } : a));

      const conv = await services.message.createConversation([user.$id, hiringApp.translatorId], job.$id);
      
      let contentStr = `Hello! Escrow deposit of $${hiringApp.bidAmount || job.budget} has been secured for the project "${job.title}". Language Pair: ${hiringApp.languagePair || 'N/A'}. You can now start working.`;
      if (job.deadline) contentStr += `\nDeadline: ${new Date(job.deadline).toLocaleDateString()}`;
      if (job.translationFileUrl) contentStr += `\n\nHere is the private translation file for this job: ${job.translationFileUrl}`;

      await services.message.sendMessage({ conversationId: conv.$id, senderId: user.$id, content: contentStr });

      await services.notification.createNotification({
        userId: hiringApp.translatorId,
        type: "job_escrow_funded",
        title: "Escrow Secured & Hired!",
        body: `Escrow for "${job.title}" is funded. Check your messages.`,
        data: { jobId: job.$id },
      });

      toast({ title: "Contract secured and translator hired successfully!", variant: "success" });
      setHiringApp(null);
    } catch {
      toast({ title: "Hiring update failed. Please contact support.", variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-16 text-center">
        <h3 className="mt-4 text-lg font-semibold">Job not found</h3>
        <p className="text-sm text-muted-foreground">The job may have been deleted or you don't have access.</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard/company")}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["company"]}>
        <div className="space-y-6 pb-16 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <Badge variant={statusBadge[job.status] || "outline"}>{job.status}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" />
                  {(() => {
                    const srcs = (job.sourceLanguage || "").split(",").map(s => s.trim()).filter(Boolean);
                    const tgts = (job.targetLanguage || "").split(",").map(t => t.trim()).filter(Boolean);
                    return srcs.flatMap(src => tgts.map(tgt => `${getLanguageName(src)} → ${getLanguageName(tgt)}`)).join(" · ");
                  })()}
                </span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.workType === "online" ? "Remote" : job.country ?? "On-site"}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" />${job.budget}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(job.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            {job.status === "open" && new Date().getTime() - new Date(job.createdAt).getTime() <= 60 * 60 * 1000 && (
              <Link href={`/dashboard/company/jobs/${job.$id}/edit`}>
                <Button variant="outline" className="gap-2"><FileText className="h-4 w-4" /> Edit Job</Button>
              </Link>
            )}
          </div>

          <Separator />
          
          {/* Job Details Card */}
          <Card className="border-border/50 bg-card/40 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Job Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Description</h4>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{job.description}</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Requirements & Details</h4>
                  <ul className="space-y-2 text-sm">
                    {job.specializations && (
                      <li className="flex gap-2">
                        <span className="font-medium min-w-24">Specializations:</span>
                        <span className="text-muted-foreground">{Array.isArray(job.specializations) ? job.specializations.join(', ') : job.specializations}</span>
                      </li>
                    )}
                    <li className="flex gap-2">
                      <span className="font-medium min-w-24">Job Type:</span>
                      <span className="text-muted-foreground capitalize">{job.jobType?.replace('_', ' ')}</span>
                    </li>
                    {job.industry && (
                      <li className="flex gap-2">
                        <span className="font-medium min-w-24">Industry:</span>
                        <span className="text-muted-foreground">{job.industry}</span>
                      </li>
                    )}
                    {job.wordCount && (
                      <li className="flex gap-2">
                        <span className="font-medium min-w-24">Word Count:</span>
                        <span className="text-muted-foreground">{job.wordCount} words</span>
                      </li>
                    )}
                    <li className="flex gap-2">
                      <span className="font-medium min-w-24">Visibility:</span>
                      <span className="text-muted-foreground capitalize">{job.visibility} {job.privateType ? `(${job.privateType})` : ''}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Testing & Materials</h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-2 items-start">
                      <span className="font-medium min-w-24">Test Required:</span>
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        {job.requiresTest ? (
                          <><CheckCircle2 className="h-4 w-4 text-success" /> Yes, Test Required</>
                        ) : (
                          <><XCircle className="h-4 w-4 text-muted-foreground" /> No</>
                        )}
                      </span>
                    </li>
                    {job.requiresTest && job.testDuration && (
                      <li className="flex gap-2 items-center">
                        <span className="font-medium min-w-24">Test Duration:</span>
                        <span className="text-muted-foreground">{job.testDuration} minutes</span>
                      </li>
                    )}
                    {job.testFileUrl && (
                      <li className="flex gap-2 items-center pt-1">
                        <span className="font-medium min-w-24">Test File:</span>
                        <a href={job.testFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3.5 w-3.5" /> View File
                        </a>
                      </li>
                    )}
                    {job.translationFileUrl && (
                      <li className="flex gap-2 items-center pt-1">
                        <span className="font-medium min-w-24">Reference File:</span>
                        <a href={job.translationFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3.5 w-3.5" /> View File
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />
          {/* Applicants Section */}
          <div className="space-y-5">
            <h2 className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5" /> Applicants & Proposals</h2>
            
            {loadingApps ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Loading candidates...</span>
              </div>
            ) : apps.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No proposals submitted for this project yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {(() => {
                  const jobPairs = (() => {
                    const targets = job.targetLanguage ? job.targetLanguage.split(",").map(t => t.trim().toUpperCase()) : [];
                    const sources = job.sourceLanguage ? job.sourceLanguage.split(",").map(s => s.trim().toUpperCase()) : [];
                    if (sources.length === 0 || targets.length === 0) return ["Default Pair"];
                    const res: string[] = [];
                    sources.forEach(s => targets.forEach(t => res.push(`${s} → ${t}`)));
                    return res;
                  })();

                  return jobPairs.map((pair) => {
                    const pairApps = apps.filter((app) => {
                      if (!app.languagePair) return true;
                      const normalizedAppPair = app.languagePair.replace(/\s+/g, "").toUpperCase();
                      const normalizedJobPair = pair.replace(/\s+/g, "").toUpperCase();
                      return normalizedAppPair === normalizedJobPair || normalizedAppPair.includes(normalizedJobPair) || normalizedJobPair.includes(normalizedAppPair);
                    });

                    const activeApp = pairApps.find(a => a.status === "accepted");

                    return (
                      <div key={pair} className="p-5 border border-border/50 rounded-2xl bg-card shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-border/30 pb-3">
                          <span className="text-sm font-bold text-teal-600 bg-teal-500/10 px-3 py-1 rounded-md uppercase tracking-wider">
                            Pair: {pair}
                          </span>
                          {activeApp && <Badge variant="success" className="uppercase font-bold">Active Translator Hired</Badge>}
                        </div>

                        {pairApps.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 italic text-center">No proposals submitted for this language pair yet.</p>
                        ) : (
                          <div className="space-y-4">
                            {pairApps.map((app) => {
                              const profile = profiles[app.translatorId];
                              const isActive = app.status === "accepted";
                              
                              return (
                                <div
                                  key={app.$id}
                                  className={`p-5 rounded-xl border border-border/40 bg-accent/5 flex flex-col md:flex-row md:items-start justify-between gap-6 transition-all hover:bg-accent/10 ${
                                    isActive ? "border-teal-500/40 bg-teal-500/[0.03] ring-1 ring-teal-500/20" : ""
                                  }`}
                                >
                                  <div className="min-w-0 flex-1 space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                      <div
                                        onClick={() => profile && setSelectedProfile(profile)}
                                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity select-none group"
                                      >
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 uppercase border border-primary/20 group-hover:border-primary">
                                          {profile?.fullName?.slice(0, 2) || "TR"}
                                        </div>
                                        <div>
                                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                            {profile?.fullName || `Translator (${app.translatorId.slice(-6).toUpperCase()})`}
                                          </p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">★ {profile?.rating || "4.8"}</span>
                                            <Badge variant="outline" className="text-[10px] py-0 px-1 font-semibold capitalize">{profile?.planTier || "Pro"}</Badge>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <Badge variant={isActive ? "success" : app.status === "rejected" ? "destructive" : "secondary"}>
                                          {app.status}
                                        </Badge>
                                        {job.requiresTest && (
                                          <Badge variant={app.testStatus === "passed" ? "success" : app.testStatus === "failed" ? "destructive" : "warning"}>
                                            Test: {app.testStatus || "pending"}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <p className="text-sm text-muted-foreground leading-relaxed p-3 bg-background/50 rounded-lg border border-border/20 whitespace-pre-wrap break-words">
                                      "{app.coverLetter}"
                                    </p>

                                    {/* Test Section */}
                                    {job.requiresTest && (app.status === "test_invited" || app.testSolutionUrl) && (
                                      <div className="mt-4 bg-indigo-50 border border-indigo-200/60 p-4 rounded-xl flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                          <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                                            <TestTube className="h-4 w-4" /> Test Phase
                                          </p>
                                          <Badge variant={app.testStatus === "passed" ? "success" : app.testStatus === "failed" ? "destructive" : "warning"} className="bg-white">
                                            {app.testStatus || "Pending Submission"}
                                          </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div className="space-y-2">
                                            <p className="text-xs text-indigo-700/80 font-medium">Original Test File</p>
                                            {job.testFileUrl ? (
                                              <a href={job.testFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm text-indigo-700 hover:text-indigo-800 font-semibold p-2.5 bg-white rounded-lg border border-indigo-100 shadow-sm transition-all w-full">
                                                <FileText className="h-4 w-4" /> Download Test File
                                              </a>
                                            ) : (
                                              <div className="p-2.5 bg-white/50 rounded-lg border border-indigo-100/50 text-xs text-indigo-500 italic text-center">No test file provided</div>
                                            )}
                                          </div>

                                          <div className="space-y-2">
                                            <p className="text-xs text-indigo-700/80 font-medium">Translator's Solution</p>
                                            {app.testSolutionUrl ? (
                                              <div className="flex items-center gap-2">
                                                <button
                                                  type="button"
                                                  onClick={() => { setPreviewUrl(app.testSolutionUrl!); setPreviewTitle(`Test Solution`); }}
                                                  className="flex-1 flex items-center justify-center gap-2 text-sm text-teal-700 font-semibold p-2.5 bg-teal-50 rounded-lg border border-teal-200 shadow-sm transition-all hover:bg-teal-100/50"
                                                >
                                                  <Eye className="h-4 w-4" /> Preview
                                                </button>
                                                <a href={app.testSolutionUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 hover:bg-muted text-teal-700 rounded-lg transition-colors border border-teal-200 bg-white shadow-sm flex-shrink-0">
                                                  <ExternalLink className="h-4 w-4" />
                                                </a>
                                              </div>
                                            ) : (
                                              <div className="p-2.5 bg-white/50 rounded-lg border border-indigo-100/50 text-xs text-indigo-500 italic text-center">Waiting for translator...</div>
                                            )}
                                          </div>
                                        </div>

                                        {app.testSubmittedAt && app.testStatus === "pending" && (
                                          (() => {
                                            const remainingHours = Math.max(0, Math.ceil((new Date(app.testSubmittedAt).getTime() + 48 * 60 * 60 * 1000 - Date.now()) / (3600 * 1000)));
                                            const isBreached = remainingHours <= 0;
                                            return (
                                              <div className="flex items-center gap-1.5 text-xs mt-1">
                                                {isBreached ? (
                                                  <span className="text-rose-500 font-bold flex items-center gap-1"><ShieldAlert className="h-4 w-4" /> 48h Response SLA Breached</span>
                                                ) : (
                                                  <span className="text-amber-500 font-semibold flex items-center gap-1 animate-pulse">⏳ {remainingHours} hours left to respond</span>
                                                )}
                                              </div>
                                            );
                                          })()
                                        )}

                                        {app.testStatus === "pending" && (
                                          <div className="space-y-3 pt-2 border-t border-border/20">
                                            <div className="space-y-1.5">
                                              <span className="text-xs font-semibold text-muted-foreground uppercase">Upload Reviewed Test File (Required)</span>
                                              <Input type="file" onChange={(e) => setReviewedFiles((prev) => ({ ...prev, [app.$id]: e.target.files?.[0] || null }))} className="h-9 text-sm" />
                                            </div>
                                            <textarea
                                              placeholder="Optional feedback on the test solution..."
                                              value={feedbackText[app.$id] || ""}
                                              onChange={(e) => setFeedbackText((prev) => ({ ...prev, [app.$id]: e.target.value }))}
                                              className="w-full text-sm p-3 rounded-md border border-border/30 bg-background resize-none h-20"
                                            />
                                            <div className="flex items-center gap-3">
                                              <Button size="sm" disabled={gradingLoading === app.$id} onClick={() => handleGradeTest(app.$id, "passed")} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                                                {gradingLoading === app.$id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Pass Test
                                              </Button>
                                              <Button size="sm" variant="destructive" disabled={gradingLoading === app.$id} onClick={() => handleGradeTest(app.$id, "failed")}>
                                                {gradingLoading === app.$id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Fail Test
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                        {app.testFeedback && (
                                          <div className="mt-2 p-3 rounded-md bg-muted/20 border border-border/20">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase">Feedback: </span>
                                            <span className="text-sm text-foreground">{app.testFeedback}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {app.status === "rejected" && app.rejectionReason && (
                                      <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20">
                                        <span className="text-xs font-semibold text-rose-600 uppercase">Rejection reason: </span>
                                        <span className="text-sm text-rose-700">{app.rejectionReason}</span>
                                      </div>
                                    )}

                                    {isActive && (
                                      <div className="mt-4 flex flex-col gap-4 p-5 rounded-xl border-2 border-teal-500/20 bg-teal-50/30">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/60 p-4 rounded-xl border border-teal-100">
                                          <div>
                                            <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Started Working</p>
                                            <p className="text-sm font-bold flex items-center gap-2"><Calendar className="h-4 w-4 text-teal-600" /> {new Date(app.updatedAt).toLocaleDateString()}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Delivery Deadline</p>
                                            <p className="text-sm font-bold flex items-center gap-2"><Clock className="h-4 w-4 text-rose-500" /> {job.deadline ? new Date(job.deadline).toLocaleString() : "Not set"}</p>
                                          </div>
                                        </div>

                                        {/* Project Files & Financials */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex flex-col gap-3">
                                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                              <FileText className="h-3.5 w-3.5" /> Project Files
                                            </p>
                                            <div className="space-y-2">
                                              {job.translationFileUrl && (
                                                <a href={job.translationFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 hover:underline font-medium p-2 bg-white rounded-lg border border-teal-100/50 shadow-sm transition-all">
                                                  <Upload className="h-4 w-4 rotate-180" /> Download Job Reference File
                                                </a>
                                              )}
                                              {app.deliveryFileUrl && (
                                                <a href={app.deliveryFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium p-2 bg-white rounded-lg border border-blue-100/50 shadow-sm transition-all">
                                                  <CheckCircle className="h-4 w-4" /> Download Delivered Work
                                                </a>
                                              )}
                                              {!job.translationFileUrl && !app.deliveryFileUrl && (
                                                <p className="text-xs text-muted-foreground italic">No files exchanged yet.</p>
                                              )}
                                            </div>
                                          </div>

                                          <div className="bg-emerald-50 border border-emerald-200/60 p-4 rounded-xl flex flex-col gap-3">
                                            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                              <DollarSign className="h-3.5 w-3.5" /> Financial Details
                                            </p>
                                            <div className="space-y-1">
                                              <div className="flex justify-between text-xs text-emerald-700">
                                                <span>Job Value:</span>
                                                <span className="font-semibold">${job.budget || 0}</span>
                                              </div>
                                              <div className="flex justify-between text-xs text-rose-600 border-b border-emerald-200/60 pb-1">
                                                <span>Platform Fee:</span>
                                                <span>(Calculated at payment)</span>
                                              </div>
                                              <div className="flex justify-between text-sm font-bold text-emerald-900 pt-1">
                                                <span>Total Cost:</span>
                                                <span>~${job.budget ? (job.budget * 1.05).toFixed(2) : 0}</span>
                                              </div>
                                            </div>
                                            {job.status === "closed" && (
                                              <Button variant="outline" size="sm" className="w-full mt-2 bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100" onClick={() => window.open(`/invoice/company/${app.$id}`, '_blank')}>
                                                <FileText className="h-3.5 w-3.5 mr-1.5" /> Download Invoice
                                              </Button>
                                            )}
                                          </div>
                                        </div>

                                        {app.extensionStatus && app.extensionStatus !== "none" && (
                                          <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                              <p className="text-sm font-bold text-orange-800 flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" /> Extension Requested</p>
                                              {app.extensionStatus === "requested" ? (
                                                <div className="flex items-center gap-2 shrink-0">
                                                  <Button size="sm" onClick={() => handleExtensionAction(app.$id, "approved")} className="bg-emerald-600 hover:bg-emerald-700 text-white">Approve</Button>
                                                  <Button size="sm" variant="destructive" onClick={() => handleExtensionAction(app.$id, "rejected")}>Reject</Button>
                                                </div>
                                              ) : (
                                                <Badge variant={app.extensionStatus === "approved" ? "success" : "destructive"} className="uppercase bg-white">{app.extensionStatus}</Badge>
                                              )}
                                            </div>
                                            <p className="text-sm text-orange-800">Reason: {app.extensionReason}</p>
                                          </div>
                                        )}

                                        {app.deliveryFileUrl && (
                                          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                                            <p className="text-sm font-bold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Final Project Delivered</p>
                                          </div>
                                        )}

                                        <div className="flex flex-wrap gap-3 items-center pt-4 border-t border-teal-500/20">
                                          <Link href="/messages">
                                            <Button size="sm" className="bg-white hover:bg-teal-50 text-teal-700 border-teal-200 shadow-sm" variant="outline"><MessageCircle className="h-4 w-4 mr-2" /> Open Chat</Button>
                                          </Link>

                                          {app.deliveryFileUrl && (
                                            <a href={app.deliveryFileUrl} target="_blank" rel="noopener noreferrer">
                                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"><FileText className="h-4 w-4 mr-2" /> Download Delivery</Button>
                                            </a>
                                          )}

                                          {app.deliveryFileUrl && app.status !== "completed" && (
                                            <>
                                              {app.escrowStatus === "disputed" ? (
                                                <div className="flex gap-2 items-center px-4 py-2 rounded-md bg-amber-50 border border-amber-200 text-amber-700 font-bold"><ShieldAlert className="h-4 w-4 text-amber-500" /> Dispute Active</div>
                                              ) : (
                                                <>
                                                  <Button size="sm" onClick={() => handleAcceptDelivery(app.$id, app.translatorId, app.bidAmount || job.budget)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse hover:animate-none border-emerald-500"><CheckCircle2 className="h-4 w-4 mr-2" /> Accept Delivery</Button>
                                                  <Button size="sm" onClick={() => setRejectTranslationApp(app)} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"><XCircle className="h-4 w-4 mr-2" /> Request Revision</Button>
                                                  <Button size="sm" onClick={() => setDisputeApp(app)} variant="outline" className="border-rose-200 text-rose-700 font-semibold hover:bg-rose-50"><ShieldAlert className="h-4 w-4 mr-2 text-rose-500" /> File Dispute</Button>
                                                </>
                                              )}
                                            </>
                                          )}
                                          
                                          {app.status === "completed" && (
                                            <div className="flex gap-2 items-center px-4 py-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Job Completed & Paid</div>
                                          )}

                                          {app.financialFileId || app.escrowStatus === "funded" || app.status === "completed" ? (
                                            <div className="flex items-center gap-2">
                                              <span className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-md border border-emerald-200">💵 Escrow Funded (${app.bidAmount || job.budget})</span>
                                            </div>
                                          ) : (
                                            <Button size="sm" onClick={() => setHiringApp(app)} className="bg-amber-500 hover:bg-amber-600 text-white font-bold">💳 Fund Escrow & Hire</Button>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-col items-end gap-4 shrink-0 border-l border-border/20 pl-6">
                                    <div className="text-right bg-background/60 p-3 rounded-lg border border-border/30 w-full">
                                      <span className="text-xl font-black text-primary flex items-center justify-end"><DollarSign className="h-5 w-5" />{app.bidAmount || job.budget}</span>
                                      <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Proposed Bid</span>
                                    </div>

                                    {!activeApp && (app.status === "submitted" || app.status === "shortlisted" || app.status === "test_invited") && (
                                      <div className="flex flex-col gap-2 w-full">
                                        {app.status === "submitted" && (
                                          <Button size="sm" onClick={() => handleShortlistTranslator(app.$id)} className="w-full font-bold bg-teal-600 hover:bg-teal-700">Invite to Test</Button>
                                        )}
                                        {app.testStatus === "passed" && (
                                          <Button size="sm" onClick={() => setHiringApp(app)} className="w-full font-bold bg-amber-500 hover:bg-amber-600 text-white">Select & Hire</Button>
                                        )}
                                        <Button size="sm" variant="outline" onClick={() => setRejectDialogApp(app)} className="w-full text-rose-500 border-rose-200 hover:bg-rose-50">Reject</Button>
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
        </div>

        {/* --- Dialogs and Modals --- */}
        {/* Reject Dialog */}
        <Dialog open={!!rejectDialogApp} onOpenChange={(open) => !open && setRejectDialogApp(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Reject Applicant</DialogTitle><DialogDescription>Provide a reason for rejecting this applicant.</DialogDescription></DialogHeader>
            <Textarea placeholder="Reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="min-h-[100px]" />
            <DialogFooter><Button variant="destructive" onClick={() => rejectDialogApp && handleRejectWithReason(rejectDialogApp.$id)}>Reject</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dispute Dialog */}
        <Dialog open={!!disputeApp} onOpenChange={(open) => !open && setDisputeApp(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-rose-500" />File a Dispute</DialogTitle><DialogDescription>Explain why you are raising a dispute. Minimally 20 characters.</DialogDescription></DialogHeader>
            <Textarea placeholder="Reason for dispute..." value={disputeReasonText} onChange={(e) => setDisputeReasonText(e.target.value)} className="min-h-[120px]" />
            <DialogFooter><Button variant="destructive" disabled={disputeReasonText.trim().length < 20 || !!submittingDisputeApp} onClick={() => disputeApp && handleFileDispute(disputeApp)}>Submit Dispute</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revision Sheet */}
        <Sheet open={!!rejectTranslationApp} onOpenChange={(open) => !open && setRejectTranslationApp(null)}>
          <SheetContent side="right" className="sm:max-w-md w-full p-6">
            <SheetHeader><SheetTitle className="text-rose-600">Request Revision</SheetTitle><SheetDescription>Upload markup and provide feedback.</SheetDescription></SheetHeader>
            <div className="space-y-4 mt-6">
              <div className="space-y-2"><Label>Reviewed File</Label><Input type="file" onChange={(e) => setRevisionFile(e.target.files?.[0] || null)} /></div>
              <div className="space-y-2"><Label>Feedback</Label><Textarea placeholder="Explain corrections..." value={revisionFeedbackText} onChange={(e) => setRevisionFeedbackText(e.target.value)} className="min-h-[150px]" /></div>
              <Button variant="destructive" className="w-full" disabled={!revisionFile || !revisionFeedbackText || submittingRevision} onClick={() => handleRejectTranslation(rejectTranslationApp)}>Request Revision</Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Hiring & Payment Sheet */}
        <Sheet open={!!hiringApp} onOpenChange={(open) => !open && setHiringApp(null)}>
          <SheetContent side="right" className="sm:max-w-xl w-full p-0 flex flex-col bg-card">
            <div className="p-8 bg-slate-900 border-b">
              <SheetHeader><SheetTitle className="text-white flex items-center gap-2"><ShieldCheck className="text-emerald-400" /> Secure Contract</SheetTitle><SheetDescription className="text-slate-300">Fund escrow to hire the translator.</SheetDescription></SheetHeader>
            </div>
            <div className="flex-1 p-8 overflow-y-auto space-y-6">
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl text-center">
                <span className="text-sm font-semibold text-muted-foreground">Total Escrow Required</span>
                <div className="text-4xl font-black text-primary mt-2">${hiringApp?.bidAmount || job?.budget}</div>
              </div>
              <div className="bg-slate-50 border rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 mb-6"><Lock className="h-4 w-4 text-emerald-500" /><span className="text-sm font-bold text-muted-foreground uppercase">Secure Checkout</span></div>
                <PayPalButton amount={hiringApp?.bidAmount || job?.budget || 0} applicationId={hiringApp?.$id || ""} onSuccess={handleHiringSuccess} />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Profile Sheet */}
        {selectedProfile && (
          <Sheet open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
            <SheetContent side="right" className="sm:max-w-lg w-full">
              <SheetHeader><SheetTitle>{selectedProfile.fullName}</SheetTitle><SheetDescription>★ {selectedProfile.rating || "4.8"}</SheetDescription></SheetHeader>
              <div className="mt-6 space-y-4">
                <p className="text-sm">{selectedProfile.bio}</p>
                <div><h4 className="font-bold text-sm mb-2">Languages</h4><div className="flex gap-2 flex-wrap">{selectedProfile.languages?.map((l: string) => <Badge key={l} variant="secondary">{getLanguageName(l)}</Badge>)}</div></div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </RoleGuard>
    </AuthGuard>
  );
}
