"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Briefcase, MoreHorizontal, Globe, MapPin, DollarSign, Calendar, Eye, XCircle, Users } from "lucide-react";
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

  return (
    <Card>
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
                {job.remote ? "Remote" : job.country}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/jobs/${job.$id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" /> View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/jobs/${job.$id}?tab=applications`} className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Applications
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
      </CardContent>
    </Card>
  );
}
