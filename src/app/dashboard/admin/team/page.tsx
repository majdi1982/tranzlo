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

interface Invitation {
  $id: string;
  email: string;
  role: string;
  profession: string;
  permissions: string[];
  isUsed: boolean;
  expiresAt: string;
  $createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: "manage_users", label: "Manage Users" },
  { id: "manage_verifications", label: "Manage Verifications" },
  { id: "manage_finances", label: "Manage Finances & Billing" },
  { id: "manage_disputes", label: "Manage Disputes" },
  { id: "manage_complaints", label: "Manage Complaints" },
];

export default function AdminTeamPage() {
  const { toast } = useToast();
  const [invitations, setInvitations] = React.useState<Invitation[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Form States
  const [email, setEmail] = React.useState("");
  const [profession, setProfession] = React.useState("");
  const [role, setRole] = React.useState<string>("staff");
  const [selectedPerms, setSelectedPerms] = React.useState<string[]>(["manage_verifications"]);
  const [submitting, setSubmitting] = React.useState(false);
  const [revokingId, setRevokingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadInvitations();
  }, []);

  async function loadInvitations() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invite");
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations || []);
      }
    } catch {
      toast({ title: "Failed to load team invitations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const handleTogglePerm = (id: string) => {
    setSelectedPerms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !profession || !role) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          profession,
          permissions: selectedPerms,
        }),
      });

      if (res.ok) {
        toast({ title: "Invitation sent successfully", variant: "success" });
        setEmail("");
        setProfession("");
        setSelectedPerms(["manage_verifications"]);
        loadInvitations();
      } else {
        const data = await res.json();
        toast({ title: "Failed to send invitation", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      const res = await fetch(`/api/admin/invite?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({ title: "Invitation revoked successfully", variant: "success" });
        setInvitations((prev) => prev.filter((inv) => inv.$id !== id));
      } else {
        toast({ title: "Failed to revoke invitation", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred during revoke", variant: "destructive" });
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Team & Recruitment
        </h1>
        <p className="text-muted-foreground text-sm">Invite and manage administrative staff, financial audit managers, and support agents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Form Panel */}
        <div className="md:col-span-1">
          <Card className="rounded-xl border-border/50 bg-card/30 backdrop-blur-xl shadow-lg h-fit sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-cyan-400" />
                Invite Team Member
              </CardTitle>
              <CardDescription className="text-3xs">
                Issue a secure register token and send invite email via SMTP.
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
                      placeholder="name@tranzlo.net"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-9 text-2xs bg-background border-border/50 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Dashboard Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-9 text-2xs bg-background border-border/50 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground rounded-lg">
                      <SelectItem value="staff" className="text-2xs">Staff / Auditor</SelectItem>
                      <SelectItem value="financial" className="text-2xs">Financial Manager</SelectItem>
                      <SelectItem value="support" className="text-2xs">Support Agent</SelectItem>
                      <SelectItem value="admin" className="text-2xs">Co-Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profession" className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Profession / Title</Label>
                  <Input
                    id="profession"
                    type="text"
                    required
                    placeholder="e.g. Accounts Auditor"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="h-9 text-2xs bg-background border-border/50 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-cyan-500/50"
                  />
                </div>

                {/* Permissions scope checkboxes */}
                <div className="space-y-2 pt-1">
                  <Label className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Assigned Scopes & Permissions</Label>
                  <div className="space-y-2 rounded-lg border border-border/40 bg-accent/5 p-3">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <div key={perm.id} className="flex items-start gap-2 cursor-pointer select-none" onClick={() => handleTogglePerm(perm.id)}>
                        <input
                          type="checkbox"
                          checked={selectedPerms.includes(perm.id)}
                          onChange={() => {}} // Handled by outer click
                          className="mt-0.5 rounded border-border bg-background text-cyan-500 focus:ring-0 focus:ring-offset-0 h-3 w-3 shrink-0"
                        />
                        <span className="text-3xs font-semibold text-foreground/80 leading-none">{perm.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full h-9 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-2xs font-bold" disabled={submitting}>
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                  Send Invite Token
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right List Panel */}
        <div className="md:col-span-2 space-y-4">
          <Card className="rounded-xl border-border/50 bg-card/30 backdrop-blur-xl shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Active Invitations</CardTitle>
              <CardDescription className="text-3xs">Pending and completed staff register tokens.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/40" />
                  ))}
                </div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-12 text-2xs text-muted-foreground">
                  No invitations issued yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.map((inv) => {
                    const isExpired = new Date().getTime() > new Date(inv.expiresAt).getTime();
                    return (
                      <div key={inv.$id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/50 bg-background/40 hover:bg-background/80 transition-all">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground truncate">{inv.email}</span>
                            <Badge variant="outline" className="text-[8px] h-3.5 py-0 px-1.5 font-bold uppercase shrink-0">
                              {inv.role}
                            </Badge>
                            {inv.isUsed ? (
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] h-3.5 font-bold rounded">✓ Active</Badge>
                            ) : isExpired ? (
                              <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[8px] h-3.5 font-bold rounded">✗ Expired</Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px] h-3.5 font-bold rounded">⚡ Pending</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-3xs text-muted-foreground">
                            <span>Profession: <strong>{inv.profession}</strong></span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> Issued: {new Date(inv.$createdAt).toLocaleDateString()}</span>
                          </div>
                          {/* Display pre-assigned permissions */}
                          {inv.permissions && inv.permissions.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {inv.permissions.map((p) => (
                                <span key={p} className="text-[8px] px-1.5 py-0 bg-accent/20 border border-border/40 text-muted-foreground rounded font-medium">
                                  {p.replace("manage_", "").replace("_", " ")}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {!inv.isUsed && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRevoke(inv.$id)}
                            disabled={revokingId === inv.$id}
                            className="h-8 w-8 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/5 transition-colors shrink-0 align-self-end sm:align-self-center"
                          >
                            {revokingId === inv.$id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
