"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Eye, Globe, DollarSign, Calendar, Clock, CheckCircle, AlertCircle, Inbox, TestTube, XCircle, MessageCircle, Upload, Loader2 } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
  const [extensionModalOpen, setExtensionModalOpen] = React.useState(false);
  const [selectedApp, setSelectedApp] = React.useState<(Application & { job?: Job }) | null>(null);
  const [testFile, setTestFile] = React.useState<File | null>(null);
  const [uploadingTest, setUploadingTest] = React.useState(false);
  const [extensionReason, setExtensionReason] = React.useState("");
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
      if (activeTab === "progress") {
        return app.status === "accepted" && app.job?.status !== "closed" && app.job?.status !== "filled";
      }
      if (activeTab === "completed") {
        return app.status === "accepted" && (app.job?.status === "closed" || app.job?.status === "filled");
      }
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

  function checkDeadlinePassed(job?: Job): boolean {
    if (!job?.testDeadline) return false;
    return new Date() > new Date(job.testDeadline);
  }

  function checkJobDeadlinePassed(job: any) {
    if (!job?.deadline) return false;
    return new Date() > new Date(job.deadline);
  }

  async function handleExtensionRequest() {
    if (!selectedApp || !extensionReason.trim()) return;
    setRequestingExtension(true);
    try {
      const services = getServices();
      await services.application.updateApplicationWithFeedback(selectedApp.$id, {
        extensionStatus: "requested",
        extensionReason: extensionReason.trim(),
        extensionRequestedAt: new Date().toISOString(),
      });

      if (selectedApp.job?.companyId) {
        await services.notification.createNotification({
          userId: selectedApp.job.companyId,
          type: "job_updated",
          title: "Extension Requested",
          body: `A translator has requested a deadline extension for "${selectedApp.job.title}".`,
          data: { jobId: selectedApp.job.$id },
        });
      }

      setApps(prev => prev.map(a => a.$id === selectedApp.$id ? { ...a, extensionStatus: "requested", extensionReason: extensionReason.trim() } : a));
      toast({ title: "Success", description: "Extension request submitted." });
      setExtensionModalOpen(false);
      setExtensionReason("");
    } catch {
      toast({ title: "Error", description: "Failed to submit extension request.", variant: "destructive" });
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
              {filteredApps.map((app) => (
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
                            {app.status === "accepted" && app.job?.status !== "closed" && app.job?.status !== "filled" && (
                              <>
                                {!checkJobDeadlinePassed(app.job) && (!app.extensionStatus || app.extensionStatus === "none") && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="gap-1.5 text-xs text-orange-600 border-orange-500/20 hover:bg-orange-500/10"
                                    onClick={() => {
                                      setSelectedApp(app);
                                      setExtensionModalOpen(true);
                                    }}
                                  >
                                    <Clock className="h-3.5 w-3.5" />
                                    Request Extension
                                  </Button>
                                )}
                                {app.extensionStatus === "requested" && (
                                  <Badge variant="outline" className="text-orange-500 border-orange-500/30">Extension Requested</Badge>
                                )}
                                {app.extensionStatus === "rejected" && (
                                  <Badge variant="destructive" className="text-3xs">Extension Rejected (Violation Recorded)</Badge>
                                )}
                                {app.extensionStatus === "approved" && (
                                  <Badge variant="success" className="text-3xs">Extension Approved</Badge>
                                )}
                              </>
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
              ))}
            </div>
          )}

          <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Test Solution</DialogTitle>
                <DialogDescription>
                  Upload your completed translation test document.
                  {selectedApp?.job?.testDeadline && (
                    <span className="block mt-2 font-semibold text-rose-600">
                      Deadline: {new Date(selectedApp.job.testDeadline).toLocaleString()}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
              <DialogFooter>
                <Button variant="outline" onClick={() => setTestModalOpen(false)}>Cancel</Button>
                {!checkDeadlinePassed(selectedApp?.job) && (
                  <Button onClick={handleTestSubmit} disabled={!testFile || uploadingTest} className="bg-teal-600 hover:bg-teal-700 text-white">
                    {uploadingTest ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Submit Solution
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Extension Modal */}
          <Dialog open={extensionModalOpen} onOpenChange={setExtensionModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Request Deadline Extension</DialogTitle>
                <DialogDescription>
                  Please provide a reason for requesting a deadline extension. Note that if the company rejects this request, it will be recorded as a violation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
              <DialogFooter>
                <Button variant="outline" onClick={() => setExtensionModalOpen(false)}>Cancel</Button>
                <Button onClick={handleExtensionRequest} disabled={!extensionReason.trim() || requestingExtension} className="bg-orange-600 hover:bg-orange-700 text-white">
                  {requestingExtension ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
