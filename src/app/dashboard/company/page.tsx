"use client";

import * as React from "react";
import Link from "next/link";
import { Briefcase, Plus, Users, FileText, CheckCircle, ArrowRight } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import type { Job, Notification } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CompanyDashboard() {
  const { user } = useSession();
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [totalApplicants, setTotalApplicants] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      if (!user?.$id) return;
      try {
        const services = getServices();
        const [myJobs, notifs] = await Promise.all([
          services.job.getJobs({ companyId: user?.$id }),
          services.notification.getNotifications(user?.$id || ""),
        ]);
        setJobs(myJobs);

        const appPromises = myJobs.map((j) => services.application.getApplications(j.$id));
        const appResults = await Promise.all(appPromises);
        setTotalApplicants(appResults.reduce((sum, apps) => sum + apps.length, 0));

        setNotifications(notifs.filter((n) => !n.read).slice(0, 5));
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
    { label: "Active Jobs", value: openJobs.length, icon: Briefcase, color: "text-blue-500" },
    { label: "Filled", value: filledJobs.length, icon: CheckCircle, color: "text-green-500" },
    { label: "Total Applicants", value: totalApplicants, icon: FileText, color: "text-purple-500" },
    { label: "Avg. Applicants", value: avgApplicants, icon: Users, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Company Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <Link href="/dashboard/company/post">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Post a Job
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                <div className={`rounded-full bg-muted p-3 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Your Active Jobs</CardTitle>
              <CardDescription>Manage your posted translation jobs</CardDescription>
            </div>
            <Link href="/dashboard/company/jobs">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : openJobs.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No active jobs yet.</p>
                <Link href="/dashboard/company/post">
                  <Button variant="outline" size="sm" className="mt-3 gap-1">
                    <Plus className="h-3 w-3" /> Post your first job
                  </Button>
                </Link>
              </div>
            ) : (
              openJobs.slice(0, 5).map((job) => (
                <div
                  key={job.$id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.sourceLanguage} → {job.targetLanguage} · ${job.budget}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 ml-2">
                    {job.specializations?.[0] ?? "General"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
              <CardDescription>Latest updates on your jobs</CardDescription>
            </div>
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No new notifications.</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif.$id} className="flex gap-3 rounded-lg border p-3">
                  <div className="h-2 w-2 mt-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{notif.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notif.body}</p>
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


