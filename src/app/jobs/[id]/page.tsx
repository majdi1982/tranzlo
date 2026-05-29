"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Globe, MapPin, DollarSign, Calendar, Briefcase, Send, Loader2, XCircle } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getLanguageName } from "@/data/languages";
import { DASHBOARD_ROUTES } from "@/constants/roles";
import type { Job, Role } from "@/types";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSession();
  const { toast } = useToast();
  const [job, setJob] = React.useState<Job | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [applying, setApplying] = React.useState(false);
  const [coverLetter, setCoverLetter] = React.useState("");
  const [hasApplied, setHasApplied] = React.useState(false);

  const role = (user?.prefs?.role as Role) || "translator";
  const isOwner = user?.$id === job?.companyId;

  React.useEffect(() => {
    async function load() {
      try {
        const services = getServices();
        const found = await services.job.getJob(params.id as string);
        setJob(found);
        if (found && user?.$id && role === "translator") {
          const myApps = await services.application.getMyApplications(user.$id);
          setHasApplied(myApps.some((a) => a.jobId === found.$id));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, user?.$id, role]);

  async function handleApply() {
    if (!user?.$id || !job) return;
    setApplying(true);
    try {
      const services = getServices();
      await services.application.apply({
        jobId: job.$id,
        coverLetter,
        translatorId: user.$id,
      });
      toast({ title: "Application submitted!", variant: "success" });
      setHasApplied(true);
    } catch {
      toast({ title: "Failed to submit application", variant: "destructive" });
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="max-w-3xl mx-auto space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </AuthGuard>
    );
  }

  if (!job) {
    return (
      <AuthGuard>
        <div className="max-w-3xl mx-auto py-16 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold">Job not found</h2>
          <p className="text-sm text-muted-foreground">This job may have been removed or closed.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push(DASHBOARD_ROUTES[role])}>
            Back to Dashboard
          </Button>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <CardDescription className="mt-1">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant={job.status === "open" ? "success" : "secondary"}>
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Globe className="h-4 w-4" />
                {getLanguageName(job.sourceLanguage)} → {getLanguageName(job.targetLanguage)}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {job.remote ? "Remote" : job.country}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                ${job.budget}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Deadline: {new Date(job.deadline).toLocaleDateString()}
              </span>
              <Badge variant="secondary">{job.specialization}</Badge>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </div>
          </CardContent>
        </Card>

        {role === "translator" && job.status === "open" && (
          <Card>
            <CardHeader>
              <CardTitle>Apply for this Job</CardTitle>
              <CardDescription>Send your application to the client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasApplied ? (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
                  <p className="font-medium">Application submitted</p>
                  <p className="text-muted-foreground mt-1">The client will review your application and get back to you.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cover Letter (optional)</label>
                    <Textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Introduce yourself and explain why you're a good fit for this project..."
                      className="min-h-[120px]"
                    />
                  </div>
                  <Button onClick={handleApply} disabled={applying} className="gap-2">
                    {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit Application
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {isOwner && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push(`/jobs/${job.$id}?tab=applications`)} className="gap-2">
              View Applications
            </Button>
            {job.status === "open" && (
              <Button variant="destructive" className="gap-2">
                <XCircle className="h-4 w-4" /> Close Job
              </Button>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
