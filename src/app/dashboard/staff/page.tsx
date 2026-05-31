"use client";

import * as React from "react";
import { UserCheck, Shield, CheckCircle, ArrowRight, Loader2, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getServices } from "@/services";
import { getDatabases, DB_ID, COLLECTIONS } from "@/lib/appwrite";
import type { Complaint, VerificationRequest } from "@/types";

export default function StaffDashboard() {
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [pendingVerifs, setPendingVerifs] = React.useState<VerificationRequest[]>([]);
  const [resolvedToday, setResolvedToday] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const services = getServices();
        const db = getDatabases();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [allComplaints, verifs, resolvedComplaints, resolvedVerifs] = await Promise.all([
          services.complaint.getAllComplaints(),
          services.verification.getPendingRequests(),
          db.listDocuments(DB_ID, COLLECTIONS.complaints, [
            (await import("@/lib/appwrite")).Query.equal("status", "resolved"),
          ]),
          db.listDocuments(DB_ID, COLLECTIONS.verificationRequests, [
            (await import("@/lib/appwrite")).Query.equal("status", "verified"),
          ]),
        ]);

        setComplaints(allComplaints.filter((c) => c.status === "open"));
        setPendingVerifs(verifs);

        const todayResolved = [...resolvedComplaints.documents, ...resolvedVerifs.documents].filter(
          (d) => d.updatedAt && new Date(d.updatedAt) >= today
        );
        setResolvedToday(todayResolved.length);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = [
    { label: "Pending Verifications", value: pendingVerifs.length, icon: UserCheck, gradient: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-500" },
    { label: "Open Complaints", value: complaints.length, icon: Shield, gradient: "from-orange-500/20 to-orange-600/10", iconColor: "text-orange-500" },
    { label: "Resolved Today", value: resolvedToday, icon: CheckCircle, gradient: "from-green-500/20 to-green-600/10", iconColor: "text-green-500" },
  ];

  return (
    <div className="space-y-8 animate-in">
      {/* Premium Staff Header */}
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-background via-accent/5 to-background p-6 md:p-8">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Moderator & Support Dashboard</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gradient bg-gradient-to-r from-primary via-cyan-400 to-primary mt-2">
              Support Center
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
              Verify platform accounts, investigate pending customer complaints, and ensure a safe experience for everyone.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/dashboard/staff/verifications">
              <Button className="gap-2 rounded-md shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-medium">
                <UserCheck className="h-4 w-4" /> Pending ({pendingVerifs.length})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Board */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg bg-gradient-to-br ${stat.gradient} p-3 ring-1 ring-border/50`}>
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
        {/* Complaints Board */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 pb-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                Open Complaints
              </CardTitle>
              <CardDescription className="text-2xs">User tickets awaiting review</CardDescription>
            </div>
            <Link href="/dashboard/staff/complaints">
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
            ) : complaints.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-xs text-muted-foreground">No open complaints at the moment.</p>
              </div>
            ) : (
              complaints.slice(0, 5).map((c) => (
                <div key={c.$id} className="p-4 transition-all hover:bg-accent/5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{c.subject}</p>
                    <p className="text-3xs text-muted-foreground line-clamp-1 mt-0.5">{c.description}</p>
                  </div>
                  <Badge variant="outline" className="text-orange-500 border-orange-500/30 bg-orange-500/5 rounded-md shrink-0">Review</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Verifications Board */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 pb-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-500" />
                Pending Verifications
              </CardTitle>
              <CardDescription className="text-2xs">Review pending translator and company verification requests</CardDescription>
            </div>
            <Link href="/dashboard/staff/verifications">
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary rounded-md text-xs font-semibold">
                Verify <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/30">
            {loading ? (
              <div className="p-6 flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pendingVerifs.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-xs text-muted-foreground">All verification requests are caught up.</p>
              </div>
            ) : (
              pendingVerifs.slice(0, 5).map((req) => (
                <div key={req.$id} className="p-4 transition-all hover:bg-accent/5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{req.userId}</p>
                    <p className="text-3xs text-muted-foreground capitalize mt-0.5">{req.role}</p>
                  </div>
                  <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/5 rounded-md shrink-0">Pending</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
