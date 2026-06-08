"use client";

import * as React from "react";
import { useSession } from "@/providers/session-provider";
import { getServices } from "@/services";
import type { Role } from "@/types";

interface AdSenseUnitProps {
  slotId: string;
  format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  responsive?: boolean;
  className?: string;
}

export function AdSenseUnit({
  slotId,
  format = "auto",
  responsive = true,
  className = "",
}: AdSenseUnitProps) {
  const { user, loading } = useSession();
  const [planTier, setPlanTier] = React.useState<string>("free");
  const [checkingPlan, setCheckingPlan] = React.useState(true);
  const [adsEnabled, setAdsEnabled] = React.useState<boolean>(true);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";

  React.useEffect(() => {
    async function checkPlan() {
      try {
        const services = getServices();
        const enabledSetting = await services.settings.getSetting("adsEnabled", "true");
        setAdsEnabled(enabledSetting === "true");
      } catch {
        setAdsEnabled(true);
      }

      if (!user?.$id) {
        setPlanTier("free"); // Guest is considered free
        setCheckingPlan(false);
        return;
      }
      try {
        const services = getServices();
        const role = (user?.prefs?.role as Role) || "translator";
        
        if (role === "translator") {
          const profile = await services.profile.getTranslatorProfile(user.$id);
          setPlanTier(profile?.planTier || "free");
        } else if (role === "company") {
          const profile = await services.profile.getCompanyProfile(user.$id);
          setPlanTier(profile?.planTier || "free");
        } else {
          setPlanTier("free");
        }
      } catch {
        setPlanTier("free");
      } finally {
        setCheckingPlan(false);
      }
    }

    if (!loading) {
      checkPlan();
    }
  }, [user?.$id, user?.prefs?.role, loading]);

  // Try to push the ad once component is rendered
  React.useEffect(() => {
    if (!checkingPlan && adsEnabled && planTier === "free" && clientId) {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      } catch (e) {
        console.warn("Google AdSense push failed:", e);
      }
    }
  }, [checkingPlan, adsEnabled, planTier, clientId]);

  if (loading || checkingPlan) {
    return null; // Don't flash ads while loading session
  }

  // If ads are globally disabled, do not render anything
  if (!adsEnabled) {
    return null;
  }

  // Hide ads for paid plan tiers (anything other than 'free')
  if (planTier !== "free") {
    return null;
  }

  // If no AdSense publisher ID is configured, show a development placeholder
  if (!clientId) {
    return (
      <div className={`my-6 mx-auto w-full max-w-4xl p-6 rounded-xl border border-dashed border-border bg-card text-card-foreground flex flex-col items-center justify-center min-h-[120px] transition-all hover:border-muted-foreground/30 ${className}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Google AdSense Space</span>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Ad unit space (Slot: <code className="px-1.5 py-0.5 rounded bg-muted text-xs">{slotId}</code>). Hidden for premium subscribers.
        </p>
      </div>
    );
  }

  return (
    <div className={`my-6 flex justify-center items-center w-full overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
