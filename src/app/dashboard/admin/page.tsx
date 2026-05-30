"use client";

import * as React from "react";
import { Users, Shield, UserCheck, AlertTriangle, ArrowRight, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getServices } from "@/services";
import type { Complaint, Dispute } from "@/types";

export default function AdminDashboard() {
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [disputes, setDisputes] = React.useState<Dispute[]>([]);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [pendingVerifications, setPendingVerifications] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const services = getServices();
        const db = (await import("@/lib/appwrite")).getDatabases();
        const { DB_ID, COLLECTIONS } = await import("@/lib/appwrite");
        const [allComplaints, allDisputes, translators, companies, verifs] = await Promise.all([
          services.complaint.getAllComplaints(),
          services.dispute.getDisputes(),
          db.listDocuments(DB_ID, COLLECTIONS.translatorProfiles),
          db.listDocuments(DB_ID, COLLECTIONS.companyProfiles),
          services.verification.getPendingRequests(),
        ]);
        setComplaints(allComplaints.filter((c) => c.status === "open"));
        setDisputes(allDisputes.filter((d) => d.status === "open"));
        setTotalUsers(translators.total + companies.total);
        setPendingVerifications(verifs.length);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, gradient: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-500" },
    { label: "Open Complaints", value: complaints.length, icon: AlertTriangle, gradient: "from-red-500/20 to-red-600/10", iconColor: "text-red-500" },
    { label: "Open Disputes", value: disputes.length, icon: Shield, gradient: "from-orange-500/20 to-orange-600/10", iconColor: "text-orange-500" },
    { label: "Pending Verifications", value: pendingVerifications, icon: UserCheck, gradient: "from-purple-500/20 to-purple-600/10", iconColor: "text-purple-500" },
  ];

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and management</p>
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
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Open Complaints
              </CardTitle>
              <CardDescription>User complaints awaiting action</CardDescription>
            </div>
            <Link href="/dashboard/admin/complaints">
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
            ) : complaints.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No open complaints.</p>
            ) : (
              complaints.slice(0, 5).map((c) => (
                <div key={c.$id} className="rounded-xl border border-border/50 p-3.5 transition-all hover:bg-accent/30">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                    <p className="text-sm font-medium truncate">{c.subject}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                Open Disputes
              </CardTitle>
              <CardDescription>Job disputes requiring resolution</CardDescription>
            </div>
            <Link href="/dashboard/admin/disputes">
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
            ) : disputes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No open disputes.</p>
            ) : (
              disputes.slice(0, 5).map((d) => (
                <div key={d.$id} className="rounded-xl border border-border/50 p-3.5 transition-all hover:bg-accent/30">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                    <p className="text-sm font-medium truncate">Dispute #{d.$id.slice(-6)}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{d.reason}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
