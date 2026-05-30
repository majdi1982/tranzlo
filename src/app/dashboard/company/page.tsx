"use client";

import * as React from "react";
import Link from "next/link";
import { Briefcase, Plus, Users, FileText, CheckCircle, ArrowRight, TrendingUp, Bell } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import type { Job, Notification } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

        setNotifs(notifications.filter((n) => !n.read).slice(0, 5));
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

  const stats = [
    { label: "Active Jobs", value: openJobs.length, icon: Briefcase, gradient: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-500" },
    { label: "Filled", value: filledJobs.length, icon: CheckCircle, gradient: "from-green-500/20 to-green-600/10", iconColor: "text-green-500" },
    { label: "Total Applicants", value: totalApplicants, icon: FileText, gradient: "from-purple-500/20 to-purple-600/10", iconColor: "text-purple-500" },
    { label: "Avg. Applicants", value: avgApplicants, icon: Users, gradient: "from-orange-500/20 to-orange-600/10", iconColor: "text-orange-500" },
  ];

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, <span className="text-primary font-medium">{user?.name}</span></p>
        </div>
        <Link href="/dashboard/company/post">
          <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <Plus className="h-4 w-4" /> Post a Job
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glass-card border-border/50 overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-3 ring-1 ring-border/50`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Your Active Jobs
              </CardTitle>
              <CardDescription>Manage your posted translation jobs</CardDescription>
            </div>
            <Link href="/dashboard/company/jobs">
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : openJobs.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No active jobs yet.</p>
                <Link href="/dashboard/company/post">
                  <Button variant="outline" size="sm" className="mt-3 gap-1 rounded-xl">
                    <Plus className="h-3 w-3" /> Post your first job
                  </Button>
                </Link>
              </div>
            ) : (
              openJobs.slice(0, 5).map((job) => (
                <div
                  key={job.$id}
                  className="flex items-center justify-between rounded-xl border border-border/50 p-3.5 transition-all hover:bg-accent/30 hover:border-border/80"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{job.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {job.sourceLanguage} → {job.targetLanguage}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-sm font-semibold text-primary">${job.budget}</span>
                    <Badge variant="secondary" className="rounded-lg text-xs">
                      {job.specializations?.[0] ?? "General"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Recent Notifications
              </CardTitle>
              <CardDescription>Latest updates on your jobs</CardDescription>
            </div>
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : notifs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No new notifications.</p>
            ) : (
              notifs.map((notif) => (
                <div key={notif.$id} className="flex gap-3 rounded-xl border border-border/50 p-3.5 transition-all hover:bg-accent/30">
                  <div className="h-2 w-2 mt-1.5 shrink-0 rounded-full bg-primary animate-pulse" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{notif.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.body}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
