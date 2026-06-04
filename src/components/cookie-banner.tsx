"use client";

import * as React from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [showBanner, setShowBanner] = React.useState(false);

  React.useEffect(() => {
    const consent = localStorage.getItem("tranzlo-cookie-consent");
    if (!consent) {
      // Delay presentation slightly for UX elegance
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("tranzlo-cookie-consent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("tranzlo-cookie-consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 z-50 max-w-sm md:max-w-md p-5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-500 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/20 text-cyan-400 shrink-0">
          <Cookie className="h-6 w-6" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-bold text-slate-100">Cookie Consent</h4>
            <button 
              onClick={() => setShowBanner(false)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            We use cookies to optimize platform performance, analyze traffic patterns, and customize authentication services. Read our {" "}
            <Link href="/cookies" className="text-cyan-400 hover:underline font-semibold">
              Cookie Policy
            </Link>{" "}
            for details.
          </p>
          <div className="flex gap-2.5 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDecline}
              className="rounded-lg text-2xs h-8 px-4 border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="rounded-lg text-2xs h-8 px-4 bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
