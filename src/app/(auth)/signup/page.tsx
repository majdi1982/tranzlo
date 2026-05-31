"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, UserPlus, Mail, Lock, User, Briefcase } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { signupSchema } from "@/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getAccount } from "@/lib/appwrite";

export default function SignupPage() {
  const router = useRouter();
  const { signup, user } = useSession();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<"translator" | "company">("translator");
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse({ email, password, name, role });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await signup(email, password, name, role);
      toast({ title: "Account created", description: "Welcome to Tranzlo! Check your email to verify your account.", variant: "success" });
      router.replace("/");
    } catch (err) {
      toast({ title: "Signup failed", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "linkedin") => {
    try {
      const account = getAccount();
      const redirectUrl = window.location.origin + "/";
      await account.createOAuth2Session(provider as any, redirectUrl, redirectUrl);
    } catch (err: any) {
      toast({
        title: "Authentication Failed",
        description: err.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass-card border-border/60 shadow-2xl shadow-primary/5">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
        <CardDescription className="text-sm">Join Tranzlo as a translator or company</CardDescription>
      </CardHeader>
      
      {/* Social Register */}
      <div className="px-6 pb-4 grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin("google")}
          className="h-11 rounded-xl bg-background/50 hover:bg-accent/40 border-border/60 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.24 1 3.2 3.74 1.25 7.75l3.86 3C6.01 7.8 8.78 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.03 3.67-5.02 3.67-8.73z"
            />
            <path
              fill="#FBBC05"
              d="M5.11 14.75c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.25 7.17C.45 8.78 0 10.59 0 12.5s.45 3.72 1.25 5.33l3.86-3.08z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.11.75-2.53 1.19-4.2 1.19-3.22 0-5.99-2.76-6.89-5.71l-3.86 3.08C3.2 20.26 7.24 23 12 23z"
            />
          </svg>
          Google
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin("linkedin")}
          className="h-11 rounded-xl bg-background/50 hover:bg-accent/40 border-border/60 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <svg className="h-4 w-4 shrink-0 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </Button>
      </div>

      <div className="relative flex items-center justify-center px-6 my-2">
        <div className="absolute inset-x-6 border-t border-border/50" />
        <span className="relative bg-[#111827] px-3 text-xs text-muted-foreground uppercase tracking-wider">
          Or continue with
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5 pt-3">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="pl-10 h-11 rounded-xl bg-background"
              />
            </div>
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="pl-10 h-11 rounded-xl bg-background"
              />
            </div>
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="pl-10 pr-10 h-11 rounded-xl bg-background"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">I want to join as</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("translator")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-5 text-sm transition-all duration-200",
                  role === "translator"
                    ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                    : "border-border/50 hover:border-muted-foreground/30 bg-background hover:bg-accent/30"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                  role === "translator" ? "bg-primary/20" : "bg-muted"
                )}>
                  <Briefcase className="h-5 w-5" />
                </div>
                <span className="font-medium">Translator</span>
                <span className="text-xs text-muted-foreground">Find translation work</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("company")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-5 text-sm transition-all duration-200",
                  role === "company"
                    ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                    : "border-border/50 hover:border-muted-foreground/30 bg-background hover:bg-accent/30"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                  role === "company" ? "bg-primary/20" : "bg-muted"
                )}>
                  <User className="h-5 w-5" />
                </div>
                <span className="font-medium">Company</span>
                <span className="text-xs text-muted-foreground">Post translation jobs</span>
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button type="submit" className="w-full h-11 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" size="lg" disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            {submitting ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
