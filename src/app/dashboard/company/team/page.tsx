"use client";

import * as React from "react";
import { Users, Mail, Shield, UserPlus, Trash2, Clock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard } from "@/guards/auth-guard";

interface TeamMember {
  id: string;
  email: string;
  role: string;
  status: "active" | "pending";
  joinedAt: string;
}

export default function CompanyTeamPage() {
  const { toast } = useToast();
  const [members, setMembers] = React.useState<TeamMember[]>([
    { id: "1", email: "procurement@company.com", role: "Administrator", status: "active", joinedAt: "2026-05-12" },
    { id: "2", email: "hr.manager@company.com", role: "Hiring Manager", status: "active", joinedAt: "2026-05-18" },
    { id: "3", email: "finance@company.com", role: "Billing Specialist", status: "pending", joinedAt: "2026-06-02" },
  ]);

  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("Hiring Manager");
  const [submitting, setSubmitting] = React.useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Please enter an email address", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const newMember: TeamMember = {
        id: Math.random().toString(),
        email,
        role,
        status: "pending",
        joinedAt: new Date().toISOString().split("T")[0],
      };
      setMembers((prev) => [newMember, ...prev]);
      toast({
        title: "Invitation Sent",
        description: `We've sent a secure access link to ${email}.`,
        variant: "success",
      });
      setEmail("");
      setSubmitting(false);
    }, 800);
  };

  const handleRevoke = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "Team member access revoked", variant: "success" });
  };

  return (
    <AuthGuard>
      <div className="space-y-6 max-w-5xl mx-auto p-4 pt-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Company Collaboration Team
          </h1>
          <p className="text-muted-foreground text-sm">
            Invite hiring managers, recruiters, and team leaders to manage job openings and hire translators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Invite Form */}
          <div className="md:col-span-1">
            <Card className="rounded-xl border-border/50 bg-card/30 backdrop-blur-xl shadow-lg sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-cyan-400" />
                  Invite Colleague
                </CardTitle>
                <CardDescription className="text-3xs">
                  Send a collaboration token to grant access to your corporate profile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="recruiter@brand.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 h-9 text-2xs bg-background border-border/50 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="role" className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Collaboration Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="h-9 text-2xs bg-background border-border/50 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground rounded-lg">
                        <SelectItem value="Administrator" className="text-2xs font-medium">Administrator (Full Access)</SelectItem>
                        <SelectItem value="Hiring Manager" className="text-2xs font-medium">Hiring Manager (Post Jobs & Chat)</SelectItem>
                        <SelectItem value="Billing Specialist" className="text-2xs font-medium">Billing Specialist (Invoices Only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full h-9 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-2xs font-bold" disabled={submitting}>
                    {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                    Send Team Invitation
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Members List */}
          <div className="md:col-span-2">
            <Card className="rounded-xl border-border/50 bg-card/30 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Active Team & Access Tokens</CardTitle>
                <CardDescription className="text-3xs">Colleagues with access to this business profile.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((m) => (
                    <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/50 bg-background/40 hover:bg-background/80 transition-all">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground truncate">{m.email}</span>
                          <Badge variant="outline" className="text-[8px] h-3.5 py-0 px-1.5 font-bold uppercase shrink-0">
                            {m.role}
                          </Badge>
                          {m.status === "active" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] h-3.5 font-bold rounded">✓ Active</Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px] h-3.5 font-bold rounded">⚡ Pending</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-3xs text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{m.status === "active" ? `Joined: ${m.joinedAt}` : `Invited: ${m.joinedAt}`}</span>
                        </div>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRevoke(m.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/5 transition-colors shrink-0 align-self-end sm:align-self-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
