"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { getServices } from "@/services";
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
  Ticket,
  Globe,
  Star,
  Megaphone,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
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
    { href: "/dashboard/translator/team", label: "Team", icon: Users },
    { href: "/dashboard/verification", label: "Verification", icon: Shield },
    { href: "/dashboard/ratings", label: "Ratings", icon: Star },
    { href: "/profile", label: "Profile", icon: User },
  ],
  company: [
    { href: "/dashboard/company", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/company/jobs", label: "My Jobs", icon: Briefcase },
    { href: "/dashboard/company/post", label: "Post a Job", icon: FileText },
    { href: "/dashboard/company/team", label: "Team", icon: Users },
    { href: "/dashboard/verification", label: "Verification", icon: Shield },
    { href: "/dashboard/ratings", label: "Ratings", icon: Star },
    { href: "/profile", label: "Profile", icon: User },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/verifications", label: "Verifications", icon: UserCheck },
    { href: "/dashboard/admin/team", label: "Team", icon: Users },
    { href: "/dashboard/admin/complaints", label: "Complaints", icon: Shield },
    { href: "/dashboard/admin/disputes", label: "Disputes", icon: Shield },
    { href: "/dashboard/admin/promo-codes", label: "Promo Codes", icon: Ticket },
    { href: "/dashboard/admin/language-requests", label: "Change Requests", icon: Globe },
    { href: "/dashboard/admin/blog-review", label: "Blog Review", icon: FileText },
    { href: "/dashboard/admin/notifications", label: "Broadcast", icon: Bell },
    { href: "/dashboard/admin/ads", label: "Ads Settings", icon: Megaphone },
    { href: "/dashboard/admin/financials", label: "Financials", icon: FileText },
  ],
  staff: [
    { href: "/dashboard/staff", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/staff/verifications", label: "Verifications", icon: UserCheck },
    { href: "/dashboard/staff/complaints", label: "Complaints", icon: Shield },
    { href: "/dashboard/verification", label: "Verification", icon: Shield },
    { href: "/profile", label: "Profile", icon: User },
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
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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
  const [avatarUrl, setAvatarUrl] = React.useState<string>("");

  React.useEffect(() => {
    async function loadAvatar() {
      if (!user?.$id) return;
      try {
        const services = getServices();
        if (userRole === "translator") {
          const profile = await services.profile.getTranslatorProfile(user.$id);
          if (profile?.avatarUrl) setAvatarUrl(profile.avatarUrl);
        } else if (userRole === "company") {
          const profile = await services.profile.getCompanyProfile(user.$id);
          if (profile?.logoUrl) setAvatarUrl(profile.logoUrl);
        }
      } catch {
        // ignore
      }
    }
    loadAvatar();
  }, [user?.$id, userRole]);

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
                  <div className="mb-6 p-4 rounded-2xl bg-muted/40 border border-border/50 shadow-inner flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-sm ring-1 ring-primary/30 overflow-hidden relative">
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt={user.name || "User Avatar"} fill className="object-cover" />
                      ) : (
                        user.name
                          ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : "?"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-2xs font-medium text-primary ring-1 ring-inset ring-primary/20 capitalize mt-1">
                        {userRole}
                      </span>
                    </div>
                  </div>
                )}

                <div className="px-1 pb-4">
                  <DashboardSidebar role={userRole} />
                </div>
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
            {/* Dashboard Integrated Footer */}
            <div className="mt-12">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
