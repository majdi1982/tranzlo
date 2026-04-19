"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Briefcase, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [role, setRole] = useState<"translator" | "company">("translator");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Registration logic will go here in Phase B
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create an account</CardTitle>
        <p className="text-sm text-center text-muted-foreground">
          Join Tranzlo as a translator or a company
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setRole("translator")}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              role === "translator" ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 grayscale hover:grayscale-0 hover:bg-muted"
            )}
          >
            <UserIcon className={cn("h-6 w-6", role === "translator" ? "text-primary" : "text-muted-foreground")} />
            <span className="text-xs font-bold uppercase tracking-wider">Translator</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("company")}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              role === "company" ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 grayscale hover:grayscale-0 hover:bg-muted"
            )}
          >
            <Briefcase className={cn("h-6 w-6", role === "company" ? "text-primary" : "text-muted-foreground")} />
            <span className="text-xs font-bold uppercase tracking-wider">Company</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              className="w-full h-10 px-3 rounded-md border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="w-full h-10 px-3 rounded-md border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="w-full h-10 px-3 rounded-md border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <Button className="w-full h-11" type="submit" disabled={loading}>
            {loading ? "Creating account..." : `Register as ${role === "translator" ? "Translator" : "Company"}`}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-center text-muted-foreground w-full">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
