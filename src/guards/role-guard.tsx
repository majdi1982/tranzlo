"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/session-provider";
import { DASHBOARD_ROUTES } from "@/constants/roles";
import type { Role } from "@/types";

export function RoleGuard({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: Role[] }) {
  const { user, loading } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const userRole = (user.prefs?.role as Role) || "translator";
    if (!allowedRoles.includes(userRole)) {
      router.replace(DASHBOARD_ROUTES[userRole] || "/");
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const userRole = (user.prefs?.role as Role) || "translator";
  if (!allowedRoles.includes(userRole)) return null;

  return <>{children}</>;
}
