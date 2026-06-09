"use client";

import * as React from "react";
import Link from "next/link";
import { Briefcase, CheckCircle, Star, FileText, ArrowRight, TrendingUp, Bell, Clock, Award, DollarSign } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import type { Job, Application, Notification } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdSenseUnit } from "@/components/adsense-unit";
import { getLanguageName } from "@/data/languages";

export default function TranslatorDashboard() {
  const { user } = useSession();
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [notifs, setNotifs] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [rating, setRating] = React.useState(0);

  React.useEffect(() => {
    async function load() {
      try {
        const services = getServices();
        const [openJobs, myApps, notifications, avgRating] = await Promise.all([
          services.job.getJobs({ status: "open" }),
          services.application.getMyApplications(user?.$id || ""),
          services.notification.getNotifications(user?.$id || ""),
          services.rating.getAverageRating(user?.$id || ""),
        ]);
        setJobs(openJobs.slice(0, 5));
        setApplications(myApps);
        setNotifs(notifications.filter((n) => !n.read).slice(0, 4));
        setRating(avgRating);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.$id]);

  const completed = applications.filter((a) => a.status === "accepted").length;
  const inProgress = applications.filter((a) => a.status === "submitted").length;

  return (
    <div className="space-y-8 animate-in">
      {/* Premium Dashboard Header */}
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-background via-accent/5 to-background p-6 md:p-8">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Pro Translator Workspace</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gradient bg-gradient-to-r from-primary via-cyan-400 to-primary mt-2">
              Workspace Overview
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
              Track your translation progress, view recent system updates, and explore high-budget freelance opportunities.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/dashboard/translator/jobs">
              <Button className="rounded-md shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-medium">
                Find Translation Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Asymmetric Core Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">Available Jobs</span>
              <div className="rounded-md bg-cyan-500/10 p-2 text-cyan-500">
                <Briefcase className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{jobs.length}</span>
              <p className="text-2xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" /> Active openings in your language pairs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">In Progress</span>
              <div className="rounded-md bg-amber-500/10 p-2 text-amber-500">
                <Clock className="h-4.5 w-4.5 animate-spin-slow" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{inProgress}</span>
              <p className="text-2xs text-muted-foreground mt-1">Submitted applications awaiting review</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">Completed Jobs</span>
              <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-500">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{completed}</span>
              <p className="text-2xs text-muted-foreground mt-1">Successfully delivered translations</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">Average Rating</span>
              <div className="rounded-md bg-yellow-500/10 p-2 text-yellow-500">
                <Star className="h-4.5 w-4.5 fill-current" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{rating > 0 ? rating.toFixed(1) : "N/A"}</span>
              <p className="text-2xs text-muted-foreground mt-1 flex items-center gap-1">
                <Award className="h-3 w-3 text-yellow-500" /> Platform quality score
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Board Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Jobs Board */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden lg:col-span-2 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 pb-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Latest Translation Openings
              </CardTitle>
              <CardDescription className="text-2xs">Recommended opportunities matching your skills</CardDescription>
            </div>
            <Link href="/dashboard/translator/jobs">
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary rounded-md text-xs font-semibold">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/30">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No matching open jobs found.</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.$id}
                  className="flex items-center justify-between p-5 transition-all hover:bg-accent/10 group cursor-pointer"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{job.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-2xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 font-medium">
                        {(() => {
                          const srcs = (job.sourceLanguage || "").split(",").map(s => s.trim()).filter(Boolean);
                          const tgts = (job.targetLanguage || "").split(",").map(t => t.trim()).filter(Boolean);
                          return srcs.flatMap(src => tgts.map(tgt => `${getLanguageName(src)} → ${getLanguageName(tgt)}`)).join(" · ");
                        })()}
                      </span>
                      <span>•</span>
                      <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-primary flex items-center justify-end">
                        <DollarSign className="h-3.5 w-3.5" /> {job.budget}
                      </span>
                      <span className="text-3xs text-muted-foreground uppercase font-semibold">Fixed Price</span>
                    </div>
                    <Link href={`/jobs/${job.$id}`}>
                      <Button variant="outline" size="sm" className="h-8 rounded-md text-xs">Apply</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right Column - Action Hub / Notifs */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <Card className="glass-card border-border/50 rounded-xl overflow-hidden shadow-md">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary animate-bounce-slow" />
                Recent Updates
              </CardTitle>
              <CardDescription className="text-2xs">System and project actions</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : notifs.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">No new updates or alerts.</p>
              ) : (
                notifs.map((notif) => (
                  <div key={notif.$id} className="flex gap-3 rounded-lg border border-border/30 bg-accent/5 p-3.5 transition-all hover:bg-accent/10">
                    <span className="h-1.5 w-1.5 mt-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{notif.title}</p>
                      <p className="text-3xs text-muted-foreground line-clamp-2 mt-0.5">{notif.body}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Google AdSense Banner */}
      <AdSenseUnit slotId="translator_dashboard_banner" />
    </div>
  );
}
