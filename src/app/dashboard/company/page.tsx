"use client";

import * as React from "react";
import Link from "next/link";
import { Briefcase, Plus, Users, FileText, CheckCircle, ArrowRight, TrendingUp, Bell, DollarSign, BarChart2 } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import type { Job, Notification } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdSenseUnit } from "@/components/adsense-unit";

export default function CompanyDashboard() {
  const { user } = useSession();
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [notifs, setNotifs] = React.useState<Notification[]>([]);
  const [totalApplicants, setTotalApplicants] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      if (!user?.$id) return;
      try {
        const services = getServices();
        const [myJobs, notifications] = await Promise.all([
          services.job.getJobs({ companyId: user?.$id }),
          services.notification.getNotifications(user?.$id || ""),
        ]);
        setJobs(myJobs);

        const appPromises = myJobs.map((j) => services.application.getApplications(j.$id));
        const appResults = await Promise.all(appPromises);
        setTotalApplicants(appResults.reduce((sum, apps) => sum + apps.length, 0));

        setNotifs(notifications.filter((n) => !n.read).slice(0, 4));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.$id]);

  const openJobs = jobs.filter((j) => j.status === "open");
  const filledJobs = jobs.filter((j) => j.status === "filled");
  const avgApplicants = jobs.length > 0 ? Math.round((totalApplicants / jobs.length) * 10) / 10 : 0;

  return (
    <div className="space-y-8 animate-in">
      {/* Premium Company Header */}
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-background via-accent/5 to-background p-6 md:p-8">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Corporate Management Suite</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gradient bg-gradient-to-r from-primary via-cyan-400 to-primary mt-2">
              Employer Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
              Oversee active projects, manage language specialists, and coordinate global translation contracts instantly.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/dashboard/company/post">
              <Button className="gap-2 rounded-md shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-medium">
                <Plus className="h-4 w-4" /> Post a Translation Job
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Board */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">Active Jobs</span>
              <div className="rounded-md bg-cyan-500/10 p-2 text-cyan-500">
                <Briefcase className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{openJobs.length}</span>
              <p className="text-2xs text-muted-foreground mt-1">Currently open for proposals</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">Filled Positions</span>
              <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-500">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{filledJobs.length}</span>
              <p className="text-2xs text-muted-foreground mt-1">Translators successfully hired</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">Total Applicants</span>
              <div className="rounded-md bg-amber-500/10 p-2 text-amber-500">
                <Users className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{totalApplicants}</span>
              <p className="text-2xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" /> Active translator applications
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">Hiring Index</span>
              <div className="rounded-md bg-yellow-500/10 p-2 text-yellow-500">
                <BarChart2 className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{avgApplicants}</span>
              <p className="text-2xs text-muted-foreground mt-1">Average applications per project</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Openings Board */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden lg:col-span-2 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 pb-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Active Job Listings
              </CardTitle>
              <CardDescription className="text-2xs">Manage your ongoing freelance listings</CardDescription>
            </div>
            <Link href="/dashboard/company/jobs">
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
            ) : openJobs.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-muted-foreground">You don't have any active listings yet.</p>
                <Link href="/dashboard/company/post">
                  <Button variant="outline" size="sm" className="mt-4 rounded-md text-xs gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Create Your First Job
                  </Button>
                </Link>
              </div>
            ) : (
              openJobs.slice(0, 5).map((job) => (
                <div
                  key={job.$id}
                  className="flex items-center justify-between p-5 transition-all hover:bg-accent/10 group cursor-pointer"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{job.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-2xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 font-medium">
                        {job.sourceLanguage} → {job.targetLanguage}
                      </span>
                      <span>•</span>
                      <span>Expires: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-primary flex items-center justify-end">
                        <DollarSign className="h-3.5 w-3.5" /> {job.budget}
                      </span>
                      <span className="text-3xs text-muted-foreground uppercase font-semibold">Fixed Budget</span>
                    </div>
                    <Link href={`/dashboard/company/jobs`}>
                      <Button variant="outline" size="sm" className="h-8 rounded-md text-xs">Manage</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* System Updates and Alerts */}
        <div className="space-y-6">
          <Card className="glass-card border-border/50 rounded-xl overflow-hidden shadow-md">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary animate-bounce-slow" />
                Employer Alerts
              </CardTitle>
              <CardDescription className="text-2xs">Latest notifications from platform administrators</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : notifs.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">All caught up! No recent alerts.</p>
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
      <AdSenseUnit slotId="company_dashboard_banner" />
    </div>
  );
}
