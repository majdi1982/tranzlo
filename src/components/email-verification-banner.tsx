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
    <div className="flex items-center justify-between gap-4 bg-amber-950/30 border border-amber-800 px-4 py-3 text-sm text-amber-400">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span>Your email address has not been verified yet.</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={sending}
        className="shrink-0 border-amber-800 text-amber-400 hover:bg-amber-950/50"
      >
        {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <MailCheck className="h-3 w-3" />}
        {sending ? "Sending..." : "Resend verification"}
      </Button>
    </div>
  );
}
