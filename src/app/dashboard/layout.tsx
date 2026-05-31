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
  Menu,
  X,
  User,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useSession } from "@/providers/session-provider";
import { DASHBOARD_ROUTES } from "@/constants/roles";
import type { Role } from "@/types";
import { AuthGuard } from "@/guards/auth-guard";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { EmailVerificationBanner } from "@/components/email-verification-banner";

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
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Account Settings", icon: Settings },
  ],
  company: [
    { href: "/dashboard/company", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/company/jobs", label: "My Jobs", icon: Briefcase },
    { href: "/dashboard/company/post", label: "Post a Job", icon: FileText },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Account Settings", icon: Settings },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/verifications", label: "Verifications", icon: UserCheck },
    { href: "/dashboard/admin/complaints", label: "Complaints", icon: Shield },
    { href: "/dashboard/admin/disputes", label: "Disputes", icon: Shield },
    { href: "/settings", label: "Account Settings", icon: Settings },
  ],
  staff: [
    { href: "/dashboard/staff", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/staff/verifications", label: "Verifications", icon: UserCheck },
    { href: "/dashboard/staff/complaints", label: "Complaints", icon: Shield },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Account Settings", icon: Settings },
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
              "group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-300",
              isActive
                ? "bg-gradient-to-r from-primary/15 via-primary/5 to-transparent text-primary glow-sm border-l-2 border-primary font-semibold"
                : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
            )}
          >
            <div className={cn(
              "flex items-center justify-center h-5 w-5 transition-transform duration-300 group-hover:scale-110",
              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <span>{link.label}</span>
            {isActive && (
              <span className="absolute right-3.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
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
        <main className="flex-1 flex">
          <aside
            className={cn(
              "fixed inset-y-16 left-0 z-40 w-64 border-r border-border/50 bg-background/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex h-full flex-col overflow-y-auto p-4 justify-between">
              <div>
                {/* User Info Card */}
                {user && (
                  <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] shadow-inner flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-sm ring-1 ring-primary/30">
                      {user.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-2xs font-medium text-primary ring-1 ring-inset ring-primary/20 capitalize mt-1">
                        {userRole}
                      </span>
                    </div>
                  </div>
                )}

                <div className="px-1">
                  <DashboardSidebar role={userRole} />
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-border/50 px-1">
                <Link
                  href={DASHBOARD_ROUTES[userRole] || "/"}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.02] rounded-xl transition-all duration-200"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Back to overview
                </Link>
              </div>
            </div>
          </aside>

          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="flex-1 overflow-x-auto p-4 sm:p-6 lg:p-8 pt-24 sm:pt-28 lg:pt-24 bg-muted/20 lg:pl-72 flex flex-col min-h-[calc(100vh-64px)]">
            <div className="flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors lg:hidden"
              >
                <Menu className="h-4 w-4" />
                Menu
              </button>
              <EmailVerificationBanner />
              {children}
            </div>
            {/* Dashboard Mini Footer */}
            <footer className="mt-12 pt-6 pb-2 text-center text-xs text-muted-foreground border-t border-border/30">
              © {new Date().getFullYear()} Tranzlo. All rights reserved.
            </footer>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
