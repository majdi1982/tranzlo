"use client";

import * as React from "react";
import { UserCheck, Shield, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
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
        const todayIso = today.toISOString();

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
    { label: "Pending Verifications", value: pendingVerifs.length, icon: UserCheck, color: "text-purple-500" },
    { label: "Open Complaints", value: complaints.length, icon: Shield, color: "text-orange-500" },
    { label: "Resolved Today", value: resolvedToday, icon: CheckCircle, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Staff Dashboard</h1>
        <p className="text-muted-foreground">Support and moderation overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <CardDescription>User complaints awaiting review</CardDescription>
            </div>
            <Link href="/dashboard/staff/complaints">
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
                    <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
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
              <CardTitle className="text-lg">Pending Verifications</CardTitle>
              <CardDescription>Translator and company verifications</CardDescription>
            </div>
            <Link href="/dashboard/staff/verifications">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pendingVerifs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No pending verification requests.</p>
            ) : (
              <div className="space-y-3">
                {pendingVerifs.slice(0, 5).map((req) => (
                  <div key={req.$id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{req.userId}</p>
                      <p className="text-xs text-muted-foreground capitalize">{req.role}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 ml-2">
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
