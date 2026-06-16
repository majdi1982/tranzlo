"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Eye, Globe, DollarSign, Calendar, Clock, CheckCircle, AlertCircle, Inbox, TestTube, XCircle, MessageCircle, Upload, Loader2, ShieldAlert } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLanguageName } from "@/data/languages";
import type { Application, Job } from "@/types";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getStorage, BUCKETS, ID } from "@/lib/appwrite";

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "outline" | "destructive"> = {
  submitted: "warning",
  viewed: "secondary",
  shortlisted: "default",
  test_invited: "default",
  accepted: "success",
  rejected: "destructive",
  withdrawn: "outline",
};

type TabType = "all" | "progress" | "completed" | "rejected";

export default function MyApplicationsPage() {
  const { user } = useSession();
  const { toast } = useToast();
  const [apps, setApps] = React.useState<(Application & { job?: Job })[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabType>("all");

  const [testModalOpen, setTestModalOpen] = React.useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = React.useState(false);
  const [extensionModalOpen, setExtensionModalOpen] = React.useState(false);
  const [chatSheetOpen, setChatSheetOpen] = React.useState(false);
  const [activeChatUrl, setActiveChatUrl] = React.useState("");
  const [selectedApp, setSelectedApp] = React.useState<(Application & { job?: Job }) | null>(null);
  const [testFile, setTestFile] = React.useState<File | null>(null);
  const [uploadingTest, setUploadingTest] = React.useState(false);
  const [extensionReason, setExtensionReason] = React.useState("");
  const [extensionDate, setExtensionDate] = React.useState("");
  const [requestingExtension, setRequestingExtension] = React.useState(false);

  React.useEffect(() => {
    load();
  }, [user?.$id]);

  async function load() {
    if (!user?.$id) return;
    try {
      const services = getServices();
      const myApps = await services.application.getMyApplications(user.$id);
      const jobs = await services.job.getJobs();
      const enriched = myApps.map((app) => ({
        ...app,
        job: jobs.find((j) => j.$id === app.jobId),
      }));
      setApps(enriched);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const filteredApps = React.useMemo(() => {
    return apps.filter((app) => {
      if (activeTab === "all") return true;
      if (activeTab === "rejected") {
        return app.status === "rejected";
      }
      return true;
    });
  }, [apps, activeTab]);

  const counts = React.useMemo(() => {
    return {
      all: apps.length,
      progress: apps.filter(app => app.status === "accepted" && app.job?.status !== "closed" && app.job?.status !== "filled").length,
      completed: apps.filter(app => app.status === "accepted" && (app.job?.status === "closed" || app.job?.status === "filled")).length,
      rejected: apps.filter(app => app.status === "rejected").length,
    };
  }, [apps]);

  async function handleTestSubmit() {
    if (!selectedApp || !testFile) return;
    
    const job = apps.find(a => a.$id === selectedApp.$id)?.job;
    if (job?.testDeadline && new Date() > new Date(job.testDeadline)) {
      toast({ title: "Deadline Passed", description: "You cannot submit the test after the deadline.", variant: "destructive" });
      setTestModalOpen(false);
      return;
    }

    setUploadingTest(true);
    try {
      const storage = getStorage();
      const uploaded = await storage.createFile(BUCKETS.TRANSLATOR_DOCUMENTS, ID.unique(), testFile);
      const fileUrl = `${storage.client.config.endpoint}/storage/buckets/${BUCKETS.TRANSLATOR_DOCUMENTS}/files/${uploaded.$id}/view?project=${storage.client.config.project}`;

      const services = getServices();
      await services.application.updateApplicationStatus(selectedApp.$id, "test_invited", "pending", fileUrl);
      
      if (job?.companyId) {
        await services.notification.createNotification({
          userId: job.companyId,
          type: "job_updated",
          title: "Test Solution Submitted",
          body: `A translator has submitted their test solution for "${job.title}".`,
          data: { jobId: job.$id },
        });
      }

      toast({ title: "Success", description: "Test solution uploaded successfully!" });
      setTestModalOpen(false);
      setTestFile(null);
      load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to upload test solution", variant: "destructive" });
    } finally {
      setUploadingTest(false);
    }
  }

  async function handleDeliverySubmit() {
    if (!selectedApp || !testFile) return;

    setUploadingTest(true);
    try {
      const storage = getStorage();
      const uploaded = await storage.createFile(BUCKETS.TRANSLATOR_DOCUMENTS, ID.unique(), testFile);
      const fileUrl = `${storage.client.config.endpoint}/storage/buckets/${BUCKETS.TRANSLATOR_DOCUMENTS}/files/${uploaded.$id}/view?project=${storage.client.config.project}`;

      const services = getServices();
      const deliveryDateStr = new Date().toISOString();

      const isRevision = selectedApp.revisionStatus === "requested";

      await services.application.updateApplicationWithFeedback(selectedApp.$id, {
        deliveryFileUrl: fileUrl,
        deliveryDate: deliveryDateStr,
        ...(isRevision ? { revisionStatus: "submitted" } : {})
      });

      if (selectedApp.job?.companyId) {
        await services.notification.createNotification({
          userId: selectedApp.job.companyId,
          type: "job_updated",
          title: isRevision ? "Revised Translation Delivered / تسليم الترجمة المعدلة" : "Final Work Delivered / تسليم العمل النهائي",
          body: `The translator has delivered the work for "${selectedApp.job.title}".`,
          data: { url: "/dashboard/company/jobs", jobId: selectedApp.job.$id },
        });
      }

      setApps(prev => prev.map(a => a.$id === selectedApp.$id ? { 
        ...a, 
        deliveryFileUrl: fileUrl, 
        deliveryDate: deliveryDateStr,
        ...(isRevision ? { revisionStatus: "submitted" as const } : {})
      } : a));
      toast({ title: "Success", description: "Final work delivered successfully!" });
      setDeliveryModalOpen(false);
      setTestFile(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to deliver work", variant: "destructive" });
    } finally {
      setUploadingTest(false);
    }
  }

  function checkDeadlinePassed(job?: Job): boolean {
    if (!job?.testDeadline) return false;
    return new Date() > new Date(job.testDeadline);
  }

  function checkJobDeadlinePassed(job: any) {
    if (!job?.deadline) return false;
    return new Date() > new Date(job.deadline);
  }

  async function handleExtensionRequest() {
    if (!selectedApp || !extensionReason.trim() || !extensionDate) return;
    setRequestingExtension(true);
    try {
      const services = getServices();
      await services.application.updateApplicationWithFeedback(selectedApp.$id, {
        extensionStatus: "requested",
        extensionReason: extensionReason.trim(),
        extensionDate: extensionDate,
        extensionRequestedAt: new Date().toISOString(),
      });

      if (selectedApp.job?.companyId) {
        await services.notification.createNotification({
          userId: selectedApp.job.companyId,
          type: "job_updated",
          title: "Extension Requested",
          body: `A translator has requested a deadline extension for "${selectedApp.job.title}" until ${extensionDate}.`,
          data: { jobId: selectedApp.job.$id },
        });
      }

      setApps(prev => prev.map(a => a.$id === selectedApp.$id ? { ...a, extensionStatus: "requested", extensionReason: extensionReason.trim(), extensionDate } : a));
      toast({ title: "Success", description: "Extension request submitted." });
      setExtensionModalOpen(false);
      setExtensionReason("");
      setExtensionDate("");
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Failed to submit extension request.", variant: "destructive" });
    } finally {
      setRequestingExtension(false);
    }
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["translator"]}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
            <p className="text-muted-foreground text-sm">Track your job applications and project statuses</p>
          </div>

          <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-muted/30 border border-border/30 backdrop-blur-md">
            {[
              { id: "all", label: "All", count: counts.all, icon: Inbox },
              { id: "progress", label: "In Progress", count: counts.progress, icon: Clock },
              { id: "completed", label: "Completed", count: counts.completed, icon: CheckCircle },
              { id: "rejected", label: "Rejected", count: counts.rejected, icon: AlertCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-300 select-none",
                    isSelected
                      ? "bg-teal-600 text-white shadow-md shadow-teal-600/10 scale-95"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "rounded-md text-3xs py-0.5 px-1.5 border font-semibold ml-1 shrink-0",
                      isSelected 
                        ? "bg-teal-700/50 text-white border-teal-500/30" 
                        : "bg-accent/60 text-muted-foreground border-border/30"
                    )}
                  >
                    {tab.count}
                  </Badge>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border/50 rounded-2xl bg-background/20">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
              <h3 className="text-sm font-bold text-foreground">No applications found</h3>
              <p className="text-xs text-muted-foreground px-4 mt-1">
                {activeTab === "all" 
                  ? "Browse available translator jobs and submit your first proposal."
                  : `You currently do not have any job applications in the '${activeTab}' category.`}
              </p>
              {activeTab === "all" && (
                <Link href="/dashboard/translator/jobs">
                  <Button className="mt-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1.5">
                    Browse Jobs
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApps.map((app) => {
                if (app.status === "accepted") {
                  return (
                    <Card key={app.$id} className="border-teal-500/30 bg-gradient-to-r from-teal-50/50 to-transparent shadow-sm rounded-2xl overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                          <div className="flex-1 space-y-4">
                            <div>
                              <h3 className="text-lg font-bold tracking-tight text-teal-950">
                                {app.job?.title || "Active Project"}
                              </h3>
                              <p className="text-sm text-teal-700 font-medium">In Progress</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/60 p-4 rounded-xl border border-teal-100/50">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Started Working</p>
                                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-teal-600" />
                                  {new Date(app.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Delivery Deadline</p>
                                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-rose-500" />
                                  {app.job?.deadline ? new Date(app.job.deadline).toLocaleString() : "Not set"}
                                </p>
                              </div>
                            </div>
                            
                            {app.extensionStatus && app.extensionStatus !== "none" && (
                              <div className="bg-orange-50/80 border border-orange-200/50 p-3 rounded-xl">
                                <p className="text-xs font-semibold text-orange-800 flex items-center justify-between mb-1">
                                  <span>Extension Request</span>
                                  <Badge variant={app.extensionStatus === "approved" ? "success" : app.extensionStatus === "rejected" ? "destructive" : "outline"} className="text-3xs uppercase tracking-wider bg-white">
                                    {app.extensionStatus}
                                  </Badge>
                                </p>
                                <p className="text-xs text-orange-700/80 line-clamp-2">Reason: {app.extensionReason}</p>
                                {app.extensionDate && (
                                  <p className="text-xs text-orange-700/80 mt-1 font-medium">Requested Date: {new Date(app.extensionDate).toLocaleDateString()}</p>
                                )}
                              </div>
                            )}

                            {/* Revision Requested Warning Banner */}
                            {app.revisionStatus === "requested" && (
                              <div className="bg-orange-50/95 border border-orange-200/50 p-4 rounded-xl flex flex-col gap-2 text-orange-950">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 shrink-0 text-orange-500 animate-pulse" />
                                  <p className="text-xs font-bold">تعديل مطلوب / Revision Requested</p>
                                </div>
                                <p className="text-[11px] text-orange-800/90 leading-relaxed bg-white/60 p-3 rounded-lg border border-orange-100/50 font-medium">
                                  <strong>Client Feedback / ملاحظات العميل:</strong> {app.revisionReason}
                                </p>
                                {app.revisionReviewedFileUrl && (
                                  <a href={app.revisionReviewedFileUrl} target="_blank" rel="noopener noreferrer" className="text-2xs font-semibold text-orange-700 hover:underline flex items-center gap-1">
                                    <FileText className="h-3.5 w-3.5" /> Download Checked/Reviewed File / تحميل ملف الملاحظات
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Active Dispute Warning Banner */}
                            {app.escrowStatus === "disputed" && (
                              <div className="bg-rose-50/90 border border-rose-200/50 p-4 rounded-xl flex items-center gap-3 text-rose-800">
                                <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600 animate-pulse" />
                                <div className="flex-1">
                                  <p className="text-xs font-bold">تنبيه: تم رفع نزاع على هذا المشروع من قبل العميل</p>
                                  <p className="text-[10px] text-rose-700/80 font-medium">Attention: Client has raised a dispute on this project. Please submit your justifications and evidence.</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-3 min-w-[200px] shrink-0">
                            {app.conversationId && (
                              <Button 
                                className="w-full justify-start gap-2 bg-white hover:bg-teal-50 text-teal-700 border-teal-200/60 shadow-sm font-semibold" 
                                variant="outline"
                                onClick={() => {
                                  setActiveChatUrl(`/messages?conversation=${app.conversationId}&embed=true`);
                                  setChatSheetOpen(true);
                                }}
                              >
                                <MessageCircle className="h-4 w-4" />
                                Open Chat Workspace
                              </Button>
                            )}
                            
                            {!checkJobDeadlinePassed(app.job) && (!app.extensionStatus || app.extensionStatus === "none") && app.escrowStatus !== "disputed" && (
                              <Button 
                                variant="outline"
                                className="w-full justify-start gap-2 bg-white hover:bg-orange-50 text-orange-600 border-orange-200/60 shadow-sm font-semibold"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setExtensionModalOpen(true);
                                }}
                              >
                                <Clock className="h-4 w-4" />
                                Request Extension
                              </Button>
                            )}
                            
                            <Button 
                              className="w-full justify-start gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm font-semibold"
                              disabled={app.revisionStatus !== "requested" && (!!app.deliveryFileUrl || app.escrowStatus === "disputed")}
                              onClick={() => {
                                setSelectedApp(app);
                                setDeliveryModalOpen(true);
                              }}
                            >
                              <Upload className="h-4 w-4" />
                              {app.escrowStatus === "disputed" ? (
                                "Disputed / قيد النزاع"
                              ) : app.revisionStatus === "requested" ? (
                                "Re-deliver Work / تسليم التعديلات"
                              ) : app.deliveryFileUrl ? (
                                "Work Delivered / تم التسليم"
                              ) : (
                                "Deliver Work"
                              )}
                            </Button>

                            {app.escrowStatus === "disputed" ? (
                              <Link href={`/dashboard/translator/disputes?id=${app.disputeId}`} className="w-full">
                                <Button className="w-full justify-start gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-sm font-semibold">
                                  <ShieldAlert className="h-4 w-4 animate-pulse" />
                                  Dispute Details / تفاصيل النزاع
                                </Button>
                              </Link>
                            ) : (
                              <Button className="w-full justify-start gap-2 bg-muted text-muted-foreground cursor-not-allowed shadow-sm font-semibold" disabled>
                                <ShieldAlert className="h-4 w-4" />
                                No Active Dispute
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                <Card key={app.$id} className="glass-card border-border/40 rounded-2xl overflow-hidden hover:shadow-lg hover:border-border/60 transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm tracking-tight text-foreground/90 truncate">
                            {app.job?.title || "Unknown Job Title"}
                          </h3>
                          <Badge variant={statusVariant[app.status] || "outline"} className="shrink-0 rounded-md text-3xs font-semibold">
                            {app.status === "test_invited" && app.testStatus === "pending" ? "test_submitted" : app.status}
                          </Badge>
                        </div>
                        {app.job && (
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3.5 w-3.5 text-muted-foreground/60" />
                              {(() => {
                                const srcs = (app.job.sourceLanguage || "").split(",").map(s => s.trim()).filter(Boolean);
                                const tgts = (app.job.targetLanguage || "").split(",").map(t => t.trim()).filter(Boolean);
                                return srcs.flatMap(src => tgts.map(tgt => `${getLanguageName(src)} → ${getLanguageName(tgt)}`)).join(" · ");
                              })()}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-teal-600">
                              <DollarSign className="h-3.5 w-3.5" />${app.job.budget}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                              Applied {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {app.coverLetter && (
                          <div className="mt-3 p-3 rounded-xl bg-accent/5 border border-border/20">
                            <p className="text-2xs text-muted-foreground line-clamp-3 leading-relaxed">{app.coverLetter}</p>
                          </div>
                        )}
                        {app.testStatus && app.testStatus !== "none" && (
                          <div className="mt-2 flex items-center gap-2">
                            <TestTube className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Test: </span>
                            <Badge variant={app.testStatus === "passed" ? "success" : app.testStatus === "failed" ? "destructive" : "warning"} className="text-3xs">
                              {app.testStatus}
                            </Badge>
                            {app.testFeedback && (
                              <span className="text-xs text-muted-foreground ml-2">
                                Feedback: {app.testFeedback}
                              </span>
                            )}
                          </div>
                        )}
                        {app.status === "rejected" && app.rejectionReason && (
                          <div className="mt-2 flex items-start gap-2 p-2 rounded-md bg-rose-500/10 border border-rose-500/20">
                            <XCircle className="h-3.5 w-3.5 text-rose-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-xs font-semibold text-rose-600">Rejection reason: </span>
                              <span className="text-xs text-rose-600">{app.rejectionReason}</span>
                            </div>
                          </div>
                        )}
                        {app.status === "test_invited" && (
                          <div className="mt-3 flex items-center gap-2">
                            {app.conversationId && (
                              <Link href={`/messages?conversation=${app.conversationId}`}>
                                <Button size="sm" variant="outline" className="gap-1.5 text-xs border-blue-500/20 text-blue-600 hover:bg-blue-500/10">
                                  <MessageCircle className="h-3.5 w-3.5" />
                                  View Conversation
                                </Button>
                              </Link>
                            )}
                            {app.status === "test_invited" && app.testStatus === "none" && (
                              <Button 
                                size="sm" 
                                className="gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setTestModalOpen(true);
                                }}
                              >
                                <Upload className="h-3.5 w-3.5" />
                                Submit Test Solution
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      {app.job && (
                        <Link href={`/jobs/${app.jobId}`}>
                          <Button variant="outline" size="icon" className="rounded-xl h-9 w-9 shrink-0 border-border/50 hover:bg-accent">
                            <Eye className="h-4.5 w-4.5 text-muted-foreground" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}

          {/* Test Solution Sheet */}
          <Sheet open={testModalOpen} onOpenChange={setTestModalOpen}>
            <SheetContent className="sm:max-w-md w-[400px]">
              <SheetHeader>
                <SheetTitle>Submit Test Solution</SheetTitle>
                <SheetDescription>
                  Upload your completed translation test document.
                  {selectedApp?.job?.testDeadline && (
                    <span className="block mt-2 font-semibold text-rose-600">
                      Deadline: {new Date(selectedApp.job.testDeadline).toLocaleString()}
                    </span>
                  )}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-6">
                {checkDeadlinePassed(selectedApp?.job) ? (
                  <div className="p-4 rounded-md bg-rose-50 text-rose-600 text-sm font-medium border border-rose-200">
                    The deadline for submitting this test has passed. You can no longer upload a solution.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="file">Upload Document</Label>
                    <Input 
                      id="file" 
                      type="file" 
                      onChange={(e) => setTestFile(e.target.files?.[0] || null)}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setTestModalOpen(false)}>Cancel</Button>
                {!checkDeadlinePassed(selectedApp?.job) && (
                  <Button onClick={handleTestSubmit} disabled={!testFile || uploadingTest} className="bg-teal-600 hover:bg-teal-700 text-white">
                    {uploadingTest ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Submit Solution
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Delivery Sheet */}
          <Sheet open={deliveryModalOpen} onOpenChange={setDeliveryModalOpen}>
            <SheetContent className="sm:max-w-md w-[400px]">
              <SheetHeader>
                <SheetTitle>Deliver Final Work</SheetTitle>
                <SheetDescription>
                  Upload your completed translation document. This will be sent directly to the client.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="deliveryFile">Upload Document</Label>
                  <Input 
                    id="deliveryFile" 
                    type="file" 
                    onChange={(e) => setTestFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDeliveryModalOpen(false)}>Cancel</Button>
                <Button onClick={handleDeliverySubmit} disabled={!testFile || uploadingTest} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {uploadingTest ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit Delivery
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Extension Sheet */}
          <Sheet open={extensionModalOpen} onOpenChange={setExtensionModalOpen}>
            <SheetContent className="sm:max-w-md w-[400px]">
              <SheetHeader>
                <SheetTitle>Request Deadline Extension</SheetTitle>
                <SheetDescription>
                  Select a new date (up to 2 days) and provide a reason. Rejection may result in a violation.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Requested Extension Date</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={extensionDate}
                    onChange={(e) => setExtensionDate(e.target.value)}
                    min={selectedApp?.job?.deadline ? new Date(selectedApp.job.deadline).toISOString().split('T')[0] : undefined}
                    max={selectedApp?.job?.deadline ? new Date(new Date(selectedApp.job.deadline).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Extension</Label>
                  <Textarea 
                    id="reason" 
                    placeholder="Explain why you need more time..."
                    value={extensionReason}
                    onChange={(e) => setExtensionReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setExtensionModalOpen(false)}>Cancel</Button>
                <Button onClick={handleExtensionRequest} disabled={!extensionReason.trim() || !extensionDate || requestingExtension} className="bg-orange-600 hover:bg-orange-700 text-white">
                  {requestingExtension ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit Request
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Chat Sheet */}
          <Sheet open={chatSheetOpen} onOpenChange={setChatSheetOpen}>
            <SheetContent side="right" className="w-full sm:w-[500px] sm:max-w-[500px] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Workspace Chat</SheetTitle>
                <SheetDescription>
                  Communicate directly with the client.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-hidden relative">
                {activeChatUrl && (
                  <iframe 
                    src={activeChatUrl} 
                    className="absolute inset-0 w-full h-full border-none"
                    title="Chat Workspace"
                  />
                )}
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
