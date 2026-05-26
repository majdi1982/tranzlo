"use client";

import * as React from "react";
import { Users, Shield, UserCheck, Briefcase, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getServices } from "@/services";
import type { Complaint, Dispute } from "@/types";

export default function AdminDashboard() {
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [disputes, setDisputes] = React.useState<Dispute[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const services = getServices();
        const [allComplaints, allDisputes] = await Promise.all([
          services.complaint.getAllComplaints(),
          services.dispute.getDisputes(),
        ]);
        setComplaints(allComplaints.filter((c) => c.status === "open"));
        setDisputes(allDisputes.filter((d) => d.status === "open"));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = [
    { label: "Total Users", value: "1,234", icon: Users, color: "text-blue-500" },
    { label: "Open Complaints", value: complaints.length, icon: AlertTriangle, color: "text-red-500" },
    { label: "Open Disputes", value: disputes.length, icon: Shield, color: "text-orange-500" },
    { label: "Pending Verifications", value: "12", icon: UserCheck, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
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
              <CardTitle className="text-lg">Open Complaints</CardTitle>
              <CardDescription>User complaints awaiting action</CardDescription>
            </div>
            <Link href="/dashboard/admin/complaints">
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
            ) : complaints.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No open complaints.</p>
            ) : (
              complaints.slice(0, 5).map((c) => (
                <div key={c.$id} className="rounded-lg border p-3">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Open Disputes</CardTitle>
              <CardDescription>Job disputes requiring resolution</CardDescription>
            </div>
            <Link href="/dashboard/admin/disputes">
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
            ) : disputes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No open disputes.</p>
            ) : (
              disputes.slice(0, 5).map((d) => (
                <div key={d.$id} className="rounded-lg border p-3">
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
