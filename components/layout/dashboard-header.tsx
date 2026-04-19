"use client";

import React from "react";
import { useAuth } from "@/providers/auth-provider";
import { Bell, Search, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const { user, role } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="h-10 w-72 rounded-2xl border border-border/60 bg-muted/50 pl-9 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <div className="flex items-center gap-3 border-l border-border/60 pl-4">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium leading-none">{user?.name || "Guest"}</p>
            <p className="text-xs text-muted-foreground capitalize">{role || "User"}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
