"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { translatorNav, companyNav, adminNav } from "@/config/nav";
import { LogOut, Languages, PanelLeftClose } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { role, logout } = useAuth();

  const getNavItems = () => {
    switch (role) {
      case "translator": return translatorNav;
      case "company": return companyNav;
      case "admin": return adminNav;
      default: return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="hidden w-72 flex-col border-r border-border/60 bg-card/80 backdrop-blur md:flex">
      <div className="flex h-16 items-center justify-between border-b border-border/60 px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Languages className="h-5 w-5" />
          </span>
          <span>Tranzlo</span>
        </Link>
        <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon as LucideIcon | undefined;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
