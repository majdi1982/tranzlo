"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Briefcase, 
  User, 
  Settings, 
  CreditCard, 
  Bell, 
  Search,
  LogOut,
  Menu,
  X,
  Globe,
  Users,
  MessageSquare,
  Megaphone
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { logout } from "@/services/auth/actions"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Briefcase, label: "Projects", href: "/dashboard/projects" },
  { icon: Users, label: "Teams", href: "/dashboard/teams" },
  { icon: Megaphone, label: "Broadcast", href: "/dashboard/admin/broadcast", role: "admin" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: MessageSquare, label: "Support", href: "/dashboard/support" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()
  const userRole = (user?.prefs as any)?.role

  const handleLogout = async () => {
    await logout()
  }

  const filteredSidebarItems = sidebarItems.filter(item => 
    !item.role || item.role === userRole
  )

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#02040a] flex text-foreground">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-16 left-0 z-40 w-64 border-r border-white/[0.05] bg-[#0b0c14] transition-transform lg:relative lg:translate-x-0 lg:inset-y-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <nav className="space-y-1.5 flex-1">
            {filteredSidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="pt-6 border-t border-white/[0.05]">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-400 hover:bg-red-500/5 rounded-xl transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
