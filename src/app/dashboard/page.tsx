"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/providers/session-provider";
import { DASHBOARD_ROUTES } from "@/constants/roles";
import type { Role } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const userRole = (user?.prefs?.role as Role) || "translator";
  const target = DASHBOARD_ROUTES[userRole] || "/dashboard/translator";

  if (typeof window !== "undefined") {
    router.replace(target);
  }

  return null;
}
