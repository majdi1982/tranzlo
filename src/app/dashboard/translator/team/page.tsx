"use client";

import * as React from "react";
import { Users, Mail, Shield, UserPlus, Trash2, Clock, CheckCircle2, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard } from "@/guards/auth-guard";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { useRouter } from "next/navigation";

interface TranslatorTeamMember {
  id: string;
  email: string;
  role: "Linguist" | "Proofreader" | "Project Manager";
  status: "active" | "pending";
  joinedAt: string;
}

export default function TranslatorTeamPage() {
  const { user } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [planTier, setPlanTier] = React.useState<"free" | "standard" | "pro" | "plus">("free");
  const [promoCodeUsed, setPromoCodeUsed] = React.useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = React.useState(true);

  const [members, setMembers] = React.useState<TranslatorTeamMember[]>([
    { id: "1", email: "junior.translator@agency.com", role: "Linguist", status: "active", joinedAt: "2026-05-20" },
  ]);

  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"Linguist" | "Proofreader" | "Project Manager">("Linguist");
  const [submitting, setSubmitting] = React.useState(false);

  // Load translator profile to check subscription plan tier
  React.useEffect(() => {
    async function loadPlan() {
      if (!user?.$id) return;
      try {
        const services = getServices();
        const profile = await services.profile.getTranslatorProfile(user.$id);
        if (profile) {
          setPlanTier((profile.planTier as any) || "free");
          setPromoCodeUsed(profile.promoCodeUsed || null);
        }
      } catch (err) {
        console.error("Failed to load translator plan tier:", err);
      } finally {
        setLoadingPlan(false);
      }
    }
    loadPlan();
  }, [user?.$id]);

  const maxMembers = planTier === "plus" && !promoCodeUsed ? 3 : 0;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Please enter an email address", variant: "destructive" });
      return;
    }

    if (members.length + 1 > maxMembers) {
      toast({
        title: "Team limit reached",
        description: `Your ${planTier.toUpperCase()} plan is limited to ${maxMembers} team member(s). Please upgrade to add more.`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const newMember: TranslatorTeamMember = {
        id: Math.random().toString(),
        email,
        role,
        status: "pending",
        joinedAt: new Date().toISOString().split("T")[0],
      };
      setMembers((prev) => [newMember, ...prev]);
      toast({
        title: "Invitation Sent",
        description: `Secure access token dispatched to ${email}.`,
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

  if (loadingPlan) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-6 max-w-5xl mx-auto p-4 pt-8">
        <div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Linguist Team & Subcontractors
            </h1>
            <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/20 font-bold text-3xs uppercase py-1 px-2.5 rounded-lg">
              Tier: {planTier === "plus" ? "Plus" : planTier === "standard" || planTier === "pro" ? "Pro" : "Free Member"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Build your translation agency. Invite sub-contractors, proofreaders, and managers to help deliver translation jobs.
          </p>
        </div>
        {planTier !== "plus" || promoCodeUsed ? (
          <Card className="glass-card border-border/40 p-8 rounded-2xl flex flex-col items-center text-center space-y-6 bg-gradient-to-br from-background/30 to-accent/5">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/20">
              <AlertTriangle className="h-8 w-8 text-amber-500 animate-bounce" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-lg font-bold text-foreground">
                {promoCodeUsed ? "Feature Restricted" : "Agency Team is Locked"}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {promoCodeUsed 
                  ? "You are using a promo code. This feature is only for paid plans."
                  : "The Free and Pro Plans do not support collaborative teams. Translators must upgrade to the Plus Plan to invite colleagues, associate linguists, or proofreaders to your agency team."}
              </p>
            </div>
            {!promoCodeUsed && (
              <Button onClick={() => router.push("/dashboard/plans")} className="rounded-xl bg-teal-600 hover:bg-teal-700 text-xs font-bold gap-2">
                <Sparkles className="h-4 w-4 text-amber-300 fill-current" />
                Upgrade Plan Tier
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Invite Form */}
            <div className="md:col-span-1">
              <Card className="rounded-xl border-border/50 bg-card/30 backdrop-blur-xl shadow-lg sticky top-20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-cyan-400" />
                    Invite Linguist
                  </CardTitle>
                  <CardDescription className="text-3xs">
                    Team slot usage: {members.length + 1} / {maxMembers} members.
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
                          placeholder="linguist@agency.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9 h-9 text-2xs bg-background border-border/50 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-cyan-500/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="role" className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Team Member Specialty</Label>
                      <Select value={role} onValueChange={(v: any) => setRole(v)}>
                        <SelectTrigger className="h-9 text-2xs bg-background border-border/50 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground rounded-lg">
                          <SelectItem value="Linguist" className="text-2xs font-medium">Linguist (Translator)</SelectItem>
                          <SelectItem value="Proofreader" className="text-2xs font-medium">Proofreader (Reviewer)</SelectItem>
                          <SelectItem value="Project Manager" className="text-2xs font-medium">Project Manager (LSP Controller)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full h-9 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-2xs font-bold" disabled={submitting}>
                      {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                      Invite Team Slot
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Members List */}
            <div className="md:col-span-2">
              <Card className="rounded-xl border-border/50 bg-card/30 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Active Sub-contractors & Associates</CardTitle>
                  <CardDescription className="text-3xs">Translators/proofreaders working under your agency account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/50 bg-background/50 border-teal-500/20">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground truncate">{user?.email}</span>
                          <Badge variant="outline" className="text-[8px] h-3.5 py-0 px-1.5 font-bold uppercase shrink-0 bg-teal-500/5 text-teal-600 border-teal-500/20">
                            Agency Owner
                          </Badge>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] h-3.5 font-bold rounded">✓ Active</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-3xs text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" />
                          <span>Primary Account Holder</span>
                        </div>
                      </div>
                    </div>

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
        )}
      </div>
    </AuthGuard>
  );
}
