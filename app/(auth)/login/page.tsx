"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  }

  return (
    <Card className="border-border/60 bg-background/95 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl">Welcome back</CardTitle>
        <p className="text-center text-sm text-muted-foreground">Sign in to continue to your Tranzlo workspace.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input id="email" type="email" className="h-11 w-full rounded-xl border bg-background px-3" placeholder="name@example.com" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-primary">Forgot password?</Link>
            </div>
            <input id="password" type="password" className="h-11 w-full rounded-xl border bg-background px-3" required />
          </div>
          <Button className="h-11 w-full" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          New here? <Link href="/register" className="font-medium text-primary">Create an account</Link>
        </p>
      </CardFooter>
    </Card>
  );
}

