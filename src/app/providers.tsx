"use client";

import { SessionProvider } from "@/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        {children}
        <Toaster />
      </SessionProvider>
    </ThemeProvider>
  );
}
