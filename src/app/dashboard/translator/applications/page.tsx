"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Eye, Globe, DollarSign, Calendar } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";
import { RoleGuard } from "@/guards/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLanguageName } from "@/data/languages";
import type { Application, Job } from "@/types";

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "outline" | "destructive"> = {
  submitted: "warning",
  viewed: "secondary",
  shortlisted: "default",
  accepted: "success",
  rejected: "destructive",
  withdrawn: "outline",
};

export default function MyApplicationsPage() {
  const { user } = useSession();
  const [apps, setApps] = React.useState<(Application & { job?: Job })[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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
    load();
  }, [user?.$id]);

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["translator"]}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">My Applications</h1>
            <p className="text-muted-foreground">Track your job applications</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : apps.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No applications yet</h3>
              <p className="text-sm text-muted-foreground">Browse available jobs and submit your first application.</p>
              <Link href="/dashboard/translator/jobs">
                <Button className="mt-4">Browse Jobs</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {apps.map((app) => (
                <Card key={app.$id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">
                            {app.job?.title || "Unknown Job"}
                          </h3>
                          <Badge variant={statusVariant[app.status] || "outline"} className="shrink-0">
                            {app.status}
                          </Badge>
                        </div>
                        {app.job && (
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3.5 w-3.5" />
                              {getLanguageName(app.job.sourceLanguage)} → {getLanguageName(app.job.targetLanguage)}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />${app.job.budget}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Applied {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {app.coverLetter && (
                          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{app.coverLetter}</p>
                        )}
                      </div>
                      {app.job && (
                        <Link href={`/jobs/${app.jobId}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
