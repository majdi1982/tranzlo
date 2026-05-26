"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "@/providers/session-provider";
import { Button } from "@/components/ui/button";
import { DASHBOARD_ROUTES } from "@/constants/roles";
import type { Role } from "@/types";
import { EmailVerificationBanner } from "@/components/email-verification-banner";

export default function HomePage() {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    const userRole = (user.prefs?.role as Role) || "translator";
    return (
      <div>
        <EmailVerificationBanner />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl">
            Welcome back, <span className="text-primary">{user.name}</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-sm md:text-base max-w-xl">
            You are signed in as a {userRole}.
          </p>
          <Link href={DASHBOARD_ROUTES[userRole] || "/"}>
            <Button size="lg" className="mt-8">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl">
        Welcome to <span className="text-primary">Tranzlo</span>
      </h1>
      <p className="mt-4 text-muted-foreground text-sm md:text-base max-w-xl">
        Connect with top freelance translators worldwide. Post translation projects, find work, and grow your translation business.
      </p>
      <div className="flex gap-4 mt-8">
        <Link href="/login">
          <Button size="lg" variant="outline">
            Sign in
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="lg">
            Get started
          </Button>
        </Link>
      </div>
    </div>
  );
}
