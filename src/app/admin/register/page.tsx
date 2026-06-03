"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Eye, EyeOff, Loader2, UserPlus, Mail, Lock, User, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const { toast } = useToast();

  const [verifying, setVerifying] = React.useState(true);
  const [isValid, setIsValid] = React.useState(false);
  const [inviteDetails, setInviteDetails] = React.useState<{
    role: string;
    profession: string;
    permissions: string[];
  } | null>(null);
  const [validationError, setValidationError] = React.useState("");

  // Registration Form States
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!token || !email) {
      setValidationError("Missing registration token or email. Please check your invitation link.");
      setVerifying(false);
      return;
    }

    async function verifyToken() {
      try {
        const res = await fetch(`/api/admin/invite?token=${token}&email=${encodeURIComponent(email!)}`);
        const data = await res.json();
        if (data.valid) {
          setIsValid(true);
          setInviteDetails({
            role: data.role,
            profession: data.profession,
            permissions: data.permissions || [],
          });
        } else {
          setValidationError(data.error || "This invitation link is invalid or has expired.");
        }
      } catch (err) {
        setValidationError("Failed to contact the server. Please try again later.");
      } finally {
        setVerifying(false);
      }
    }

    verifyToken();
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password must be at least 8 characters long", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, name, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast({
          title: "Account Created Successfully",
          description: "Administrative account initialized. You can now log in.",
          variant: "success",
        });
        router.push("/login");
      } else {
        toast({
          title: "Registration Failed",
          description: data.error || "Failed to create account. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative bg-grid">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        {verifying ? (
          <Card className="glass-card border-border/60 shadow-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium">Verifying invitation token...</p>
            </CardContent>
          </Card>
        ) : !isValid ? (
          <Card className="glass-card border-border/60 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center ring-1 ring-rose-500/20">
                <AlertTriangle className="h-6 w-6 text-rose-500" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-rose-500">Invalid Invitation</CardTitle>
              <CardDescription className="text-xs mt-2 px-4 leading-relaxed">
                {validationError}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link href="/">
                <Button variant="outline" className="text-xs h-9 rounded-lg">
                  Return to Home
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <Card className="glass-card border-border/60 shadow-2xl shadow-primary/5">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">Complete Registration</CardTitle>
              <CardDescription className="text-xs mt-2">
                Join the administrative team as a <span className="text-primary font-bold">{inviteDetails?.role.toUpperCase()}</span> ({inviteDetails?.profession})
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      disabled
                      value={email || ""}
                      className="pl-9 h-10 rounded-lg bg-background text-muted-foreground opacity-75 border-border/50 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g. Abdullah Ahmed"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-10 rounded-lg bg-background border-border/50 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-semibold">Set Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 h-10 rounded-lg bg-background border-border/50 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-cyan-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Pre-assigned permissions check list */}
                {inviteDetails?.permissions && inviteDetails.permissions.length > 0 && (
                  <div className="space-y-1.5 p-3 rounded-lg border border-border/40 bg-accent/5 mt-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Assigned Scopes</span>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {inviteDetails.permissions.map((perm) => (
                        <div key={perm} className="flex items-center gap-1.5 text-3xs text-foreground/80 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{perm.replace(/_/g, " ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-2">
                <Button type="submit" className="w-full h-10 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold font-semibold shadow-lg shadow-cyan-600/10" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="h-3.5 w-3.5 mr-2" />
                  )}
                  {submitting ? "Initializing account..." : "Complete & Activate"}
                </Button>
                <p className="text-center text-2xs text-muted-foreground">
                  Already activated?{" "}
                  <Link href="/login" className="text-cyan-500 hover:underline font-semibold">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AdminRegisterPage() {
  return (
    <React.Suspense fallback={
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <RegisterContent />
    </React.Suspense>
  );
}
