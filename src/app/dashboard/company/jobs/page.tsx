"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Briefcase, Globe, MapPin, DollarSign, Calendar, ChevronRight, MoreHorizontal, Eye, FileText, XCircle } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getLanguageName } from "@/data/languages";
import type { Job } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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

function JobCard({ job, onClose, closingId }: { job: Job; onClose: (id: string) => void; closingId: string | null }) {
  const [showCloseDialog, setShowCloseDialog] = React.useState(false);

  return (
    <Card className="glass-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-md group">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <Link href={`/dashboard/company/jobs/${job.$id}`} className="min-w-0 flex-1 cursor-pointer block">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{job.title}</h3>
              <Badge variant={statusBadge[job.status] || "outline"} className="shrink-0 uppercase font-bold text-xs tracking-wider">
                {job.status}
              </Badge>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
              <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                <Globe className="h-4 w-4 text-primary/70" />
                <span className="font-medium text-foreground/80">
                {(() => {
                  const srcs = (job.sourceLanguage || "").split(",").map(s => s.trim()).filter(Boolean);
                  const tgts = (job.targetLanguage || "").split(",").map(t => t.trim()).filter(Boolean);
                  return srcs.flatMap(src => tgts.map(tgt => `${getLanguageName(src)} → ${getLanguageName(tgt)}`)).join(" · ");
                })()}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.workType === "online" ? "Remote" : job.country ?? "On-site"}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-foreground/90">
                <DollarSign className="h-4 w-4" />${job.budget}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(job.deadline).toLocaleDateString()}
              </span>
            </div>
          </Link>

          <div className="shrink-0 flex items-center gap-2 pl-4 border-l border-border/40">
            <Link href={`/dashboard/company/jobs/${job.$id}`}>
              <Button variant="ghost" className="h-10 w-10 p-0 rounded-full group-hover:bg-primary/10 group-hover:text-primary">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 border border-border/50">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/jobs/${job.$id}`} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" /> View Public Job Page
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
      </CardContent>
    </Card>
  );
}
