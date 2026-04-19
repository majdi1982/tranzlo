"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { publicNav } from "@/config/nav";
import { Languages, Menu, Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Languages className="h-5 w-5" />
            </span>
            <span className="hidden sm:block">Tranzlo</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button className="shadow-sm shadow-primary/10">
              <Sparkles className="mr-2 h-4 w-4" />
              Join Marketplace
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
