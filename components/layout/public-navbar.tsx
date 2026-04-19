"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { publicNavItems } from "@/lib/site-content";
import { Languages, Menu, Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container mx-auto flex h-18 items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <Languages className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">Tranzlo</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {publicNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button className="shadow-sm shadow-primary/20">
              <Sparkles className="mr-2 h-4 w-4" />
              Get started
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

