"use client";

import * as React from "react";
import { Shield, ShieldAlert, ShieldCheck, ShieldAlert as ShieldX, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import { AuthGuard } from "@/guards/auth-guard";

export default function VerificationPage() {
  const { user } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState<"unverified" | "pending" | "verified" | "rejected">("unverified");
  const [adminNote, setAdminNote] = React.useState("");

  const role = user?.prefs?.role || "translator";

  React.useEffect(() => {
    async function loadStatus() {
      if (!user?.$id) return;
      try {
        const services = getServices();
        if (role === "translator") {
          const profile = await services.profile.getTranslatorProfile(user.$id);
          if (profile) {
            setStatus((profile.verificationStatus as any) || "unverified");
          }
        } else {
          const profile = await services.profile.getCompanyProfile(user.$id);
          if (profile) {
            setStatus((profile.verificationStatus as any) || "unverified");
          }
        }
      } catch {
        toast({ title: "Failed to load verification status", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, [user?.$id, role, toast]);

  async function handleSubmitRequest() {
    if (!user?.$id) return;
    setSubmitting(true);
    try {
      const services = getServices();
      await services.verification.submitRequest(user.$id, role);
      setStatus("pending");
      toast({ title: "Verification request submitted successfully", variant: "success" });
    } catch {
      toast({ title: "Failed to submit verification request", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  const renderStatusDetails = () => {
    switch (status) {
      case "verified":
        return {
          icon: <ShieldCheck className="h-16 w-16 text-emerald-500 animate-pulse" />,
          title: "Account Verified Successfully",
          description: "Your profile has been fully vetted by our safety team. You now have a verified badge and priority indexing on search pages.",
          badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        };
      case "pending":
        return {
          icon: <Shield className="h-16 w-16 text-amber-500 animate-pulse" />,
          title: "Verification Request Pending",
          description: "Your verification request is currently under review by our administration. We will update your status shortly.",
          badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        };
      case "rejected":
        return {
          icon: <ShieldX className="h-16 w-16 text-rose-500" />,
          title: "Verification Request Rejected",
          description: "Unfortunately, your verification request was not approved. You can review the admin notes below and re-submit when ready.",
          badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        };
      default:
        return {
          icon: <ShieldAlert className="h-16 w-16 text-slate-500" />,
          title: "Account Unverified",
          description: "Submit a request to verify your identity/company legitimacy and unlock the verified badge across the platform.",
          badgeColor: "bg-slate-500/10 text-slate-400 border-slate-800",
        };
    }
  };

  const details = renderStatusDetails();

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto space-y-6 pt-8 pb-16 px-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground/95">Identity Verification</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account credibility and request verified badges
          </p>
        </div>

        <Card className="glass-card p-8 border-border/40 rounded-2xl flex flex-col items-center text-center space-y-6 bg-gradient-to-br from-background/30 to-accent/5">
          <div className="flex justify-center p-4 rounded-3xl bg-accent/10">
            {details.icon}
          </div>

          <div className="space-y-2 max-w-md">
            <div className="flex justify-center mb-1">
              <Badge variant="outline" className={`capitalize font-semibold rounded-lg ${details.badgeColor}`}>
                {status}
              </Badge>
            </div>
            <h2 className="text-xl font-bold tracking-tight">{details.title}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {details.description}
            </p>
          </div>

          {status === "unverified" && (
            <Button
              onClick={handleSubmitRequest}
              disabled={submitting}
              className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium gap-2 shadow-md transition-all duration-300"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Submit Verification Request <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}

          {status === "rejected" && (
            <div className="w-full max-w-md p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-200 text-xs text-left space-y-2">
              <h4 className="font-bold">Rejection Feedback:</h4>
              <p className="italic text-rose-300">
                {adminNote || "Please ensure your profile is fully complete with correct documents before requesting verification."}
              </p>
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  size="sm"
                  className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-Submit Request"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AuthGuard>
  );
}
