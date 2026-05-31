"use client";

import * as React from "react";
import { ShieldAlert, MailCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/providers/session-provider";
import { toast } from "@/hooks/use-toast";

export function EmailVerificationBanner() {
  const { user } = useSession();
  const [sending, setSending] = React.useState(false);

  if (!user || user.emailVerification) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      const { getServices } = await import("@/services");
      await getServices().auth.resendVerification();
      toast({ title: "Verification email sent", description: "Check your inbox for the verification link." });
    } catch {
      toast({ title: "Failed to send", description: "Please try again later.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-950/20 border border-amber-500/30 px-5 py-4 text-sm text-amber-400 rounded-xl mb-6 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
        <span className="font-medium">Your email address has not been verified yet. Please check your inbox.</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={sending}
        className="shrink-0 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-md"
      >
        {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MailCheck className="h-3.5 w-3.5" />}
        {sending ? "Sending..." : "Resend verification email"}
      </Button>
    </div>
  );
}
