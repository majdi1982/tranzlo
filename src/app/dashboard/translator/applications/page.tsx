"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Eye, Globe, DollarSign, Calendar, Clock, CheckCircle, AlertCircle, Inbox } from "lucide-react";
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

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "outline" | "destructive"> = {
  submitted: "warning",
  viewed: "secondary",
  shortlisted: "default",
  accepted: "success",
  rejected: "destructive",
  withdrawn: "outline",
};

type TabType = "all" | "progress" | "completed" | "rejected";

export default function MyApplicationsPage() {
  const { user } = useSession();
  const [apps, setApps] = React.useState<(Application & { job?: Job })[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabType>("all");

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

  // Filter lists based on user criteria
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

  // Dynamic counts for each tab pill
  const counts = React.useMemo(() => {
    return {
      all: apps.length,
      progress: apps.filter(app => app.status === "accepted" && app.job?.status !== "closed" && app.job?.status !== "filled").length,
      completed: apps.filter(app => app.status === "accepted" && (app.job?.status === "closed" || app.job?.status === "filled")).length,
      rejected: apps.filter(app => app.status === "rejected").length,
    };
  }, [apps]);

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["translator"]}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
            <p className="text-muted-foreground text-sm">Track your job applications and project statuses</p>
          </div>

          {/* Premium Glassmorphism Tab Selector */}
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
                            {app.status}
                          </Badge>
                        </div>
                        {app.job && (
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3.5 w-3.5 text-muted-foreground/60" />
                              {getLanguageName(app.job.sourceLanguage)} → {getLanguageName(app.job.targetLanguage)}
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
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
