"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Shield, UserCheck, AlertTriangle, ArrowRight, Activity, Cpu, ShieldAlert } from "lucide-react";
import { getServices } from "@/services";
import type { Complaint, Dispute } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="space-y-8 animate-in">
      {/* Premium Admin Header */}
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-background via-accent/5 to-background p-6 md:p-8">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">System Administrator Command Center</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gradient bg-gradient-to-r from-primary via-cyan-400 to-primary mt-2">
              Platform Administration
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
              Monitor key metrics, resolve disputes, approve verifications, and guarantee platform integrity securely.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/dashboard/admin/verifications">
              <Button className="gap-2 rounded-md shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-medium">
                <UserCheck className="h-4 w-4" /> Pending Requests ({pendingVerifications})
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
              <span className="text-xs font-medium text-muted-foreground uppercase">Platform Users</span>
              <div className="rounded-md bg-cyan-500/10 p-2 text-cyan-500">
                <Users className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{totalUsers}</span>
              <p className="text-2xs text-muted-foreground mt-1">Translators and Client Companies</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">Open Complaints</span>
              <div className="rounded-md bg-rose-500/10 p-2 text-rose-500">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{complaints.length}</span>
              <p className="text-2xs text-muted-foreground mt-1">Users awaiting support response</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">Active Disputes</span>
              <div className="rounded-md bg-amber-500/10 p-2 text-amber-500">
                <ShieldAlert className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">{disputes.length}</span>
              <p className="text-2xs text-muted-foreground mt-1">Job payment or delivery disputes</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">System Status</span>
              <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-500">
                <Cpu className="h-4.5 w-4.5 animate-pulse" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight">100%</span>
              <p className="text-2xs text-muted-foreground mt-1">All core system nodes operational</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Case Boards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Complaints Board */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 pb-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />
                Urgent User Complaints
              </CardTitle>
              <CardDescription className="text-2xs">Pending customer support tickets</CardDescription>
            </div>
            <Link href="/dashboard/admin/complaints">
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary rounded-md text-xs font-semibold">
                Manage <ArrowRight className="h-3.5 w-3.5" />
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
                <p className="text-xs text-muted-foreground">All support tickets are successfully resolved.</p>
              </div>
            ) : (
              complaints.slice(0, 5).map((c) => (
                <div key={c.$id} className="p-4 transition-all hover:bg-accent/5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{c.subject}</p>
                    <p className="text-3xs text-muted-foreground line-clamp-1 mt-0.5">{c.description}</p>
                  </div>
                  <Badge variant="outline" className="text-rose-500 border-rose-500/30 bg-rose-500/5 rounded-md shrink-0">Urgent</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Disputes Board */}
        <Card className="glass-card border-border/50 rounded-xl overflow-hidden shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 pb-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                Platform Contract Disputes
              </CardTitle>
              <CardDescription className="text-2xs">Resolve active project arbitration cases</CardDescription>
            </div>
            <Link href="/dashboard/admin/disputes">
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary rounded-md text-xs font-semibold">
                Arbitrate <ArrowRight className="h-3.5 w-3.5" />
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
            ) : disputes.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-xs text-muted-foreground">No pending arbitration cases.</p>
              </div>
            ) : (
              disputes.slice(0, 5).map((d) => (
                <div key={d.$id} className="p-4 transition-all hover:bg-accent/5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">Dispute #{d.$id.slice(-6)}</p>
                    <p className="text-3xs text-muted-foreground line-clamp-1 mt-0.5">{d.reason}</p>
                  </div>
                  <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/5 rounded-md shrink-0">Review</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
