"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageSquare,
  Bell,
  Shield,
  Users,
  UserCheck,
  Settings,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useSession } from "@/providers/session-provider";
import { DASHBOARD_ROUTES } from "@/constants/roles";
import type { Role } from "@/types";
import { AuthGuard } from "@/guards/auth-guard";
import { cn } from "@/lib/utils";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const roleSidebarLinks: Record<Role, SidebarLink[]> = {
  translator: [
    { href: "/dashboard/translator", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/translator/jobs", label: "Browse Jobs", icon: Briefcase },
    { href: "/dashboard/translator/applications", label: "My Applications", icon: FileText },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile", icon: Settings },
  ],
  company: [
    { href: "/dashboard/company", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/company/jobs", label: "My Jobs", icon: Briefcase },
    { href: "/dashboard/company/post", label: "Post a Job", icon: FileText },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile", icon: Settings },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/verifications", label: "Verifications", icon: UserCheck },
    { href: "/dashboard/admin/complaints", label: "Complaints", icon: Shield },
    { href: "/dashboard/admin/disputes", label: "Disputes", icon: Shield },
    { href: "/settings", label: "Settings", icon: Settings },
  ],
  staff: [
    { href: "/dashboard/staff", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/staff/verifications", label: "Verifications", icon: UserCheck },
    { href: "/dashboard/staff/complaints", label: "Complaints", icon: Shield },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile", icon: Settings },
  ],
};

function DashboardSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = roleSidebarLinks[role];

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{link.label}</span>
            {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const userRole = (user?.prefs?.role as Role) || "translator";

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex min-h-[calc(100vh-4rem)]">
          <aside
            className={cn(
              "fixed inset-y-16 left-0 z-40 w-64 border-r bg-background transition-transform lg:static lg:translate-x-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {userRole} Dashboard
                </p>
              </div>
              <DashboardSidebar role={userRole} />
            </div>
          </aside>

          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              {sidebarOpen ? "Close menu" : "Menu"}
            </button>
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
