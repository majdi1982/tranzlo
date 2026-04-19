"use client";

import Link from "next/link";
import { useState } from "react";
import { Briefcase, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [role, setRole] = useState<"translator" | "company">("translator");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  }

  return (
    <Card className="border-border/60 bg-background/95 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl">Create an account</CardTitle>
        <p className="text-center text-sm text-muted-foreground">Choose your role and continue into the correct flow.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={() => setRole("translator")} className={cn("rounded-2xl border p-4 text-left transition", role === "translator" ? "border-primary bg-primary/5" : "border-border/60 bg-muted/20")}>
            <UserIcon className="h-5 w-5 text-primary" />
            <div className="mt-3 text-sm font-semibold">Translator</div>
            <div className="text-xs text-muted-foreground">Build a profile and apply to jobs.</div>
          </button>
          <button type="button" onClick={() => setRole("company")} className={cn("rounded-2xl border p-4 text-left transition", role === "company" ? "border-primary bg-primary/5" : "border-border/60 bg-muted/20")}>
            <Briefcase className="h-5 w-5 text-primary" />
            <div className="mt-3 text-sm font-semibold">Company</div>
            <div className="text-xs text-muted-foreground">Post jobs and review candidates.</div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">Full name</label>
            <input id="name" type="text" className="h-11 w-full rounded-xl border bg-background px-3" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input id="email" type="email" className="h-11 w-full rounded-xl border bg-background px-3" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <input id="password" type="password" className="h-11 w-full rounded-xl border bg-background px-3" required />
          </div>
          <Button className="h-11 w-full" type="submit" disabled={loading}>{loading ? "Creating account..." : `Continue as ${role}`}</Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="font-medium text-primary">Sign in</Link>
        </p>
      </CardFooter>
    </Card>
  );
}

