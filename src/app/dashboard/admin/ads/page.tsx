"use client";

import * as React from "react";
import { Megaphone, AlertCircle, ShieldAlert, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getServices } from "@/services";

export default function AdminAdsPage() {
  const { toast } = useToast();
  
  const [adsEnabled, setAdsEnabled] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [updating, setUpdating] = React.useState<boolean>(false);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";

  React.useEffect(() => {
    async function loadSettings() {
      try {
        const services = getServices();
        const enabled = await services.settings.getSetting("adsEnabled", "true");
        setAdsEnabled(enabled === "true");
      } catch {
        toast({ title: "Failed to load settings", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [toast]);

  async function handleToggleAds() {
    setUpdating(true);
    const newValue = !adsEnabled;
    try {
      const services = getServices();
      await services.settings.setSetting("adsEnabled", newValue ? "true" : "false");
      setAdsEnabled(newValue);
      
      toast({
        title: newValue ? "Ads enabled globally" : "Ads disabled globally",
        description: newValue
          ? "All guest and free tier users will see advertisements."
          : "Advertisements have been hidden website-wide for everyone.",
      });
    } catch {
      toast({ title: "Failed to update ads status", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ads Settings</h1>
        <p className="text-sm text-muted-foreground">Manage website-wide Google AdSense configuration and toggles</p>
      </div>

      {loading ? (
        <Card className="p-8 flex items-center justify-center min-h-[250px] border-border/50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-xs text-muted-foreground">Loading advertising preferences...</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6 animate-in">
          {/* Main Toggle Switch Card */}
          <Card className="glass-card border-border/50 overflow-hidden bg-card/25 shadow-sm rounded-2xl">
            <CardHeader className="pb-4 border-b border-border/10 bg-muted/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                  <Megaphone className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Global Advertising Switch</CardTitle>
                  <CardDescription className="text-3xs">Enable or disable Google AdSense advertisements website-wide</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-accent/5">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground">
                    Status: {adsEnabled ? "Enabled" : "Disabled"}
                  </h4>
                  <p className="text-3xs text-muted-foreground leading-relaxed max-w-md">
                    {adsEnabled
                      ? "Google AdSense ads are active and running on the homepage, blog list, public profiles, and Free subscription dashboards."
                      : "All Google AdSense components are currently suppressed. No ads are visible to any users or guest visitors."}
                  </p>
                </div>
                <Button
                  onClick={handleToggleAds}
                  disabled={updating}
                  className={`rounded-xl px-6 min-w-[120px] text-xs font-bold shadow-md transition-all ${
                    adsEnabled
                      ? "bg-red-600 hover:bg-red-700 text-white hover:shadow-red-500/15"
                      : "bg-teal-600 hover:bg-teal-700 text-white hover:shadow-teal-500/15"
                  }`}
                >
                  {updating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : adsEnabled ? (
                    "Disable Ads"
                  ) : (
                    "Enable Ads"
                  )}
                </Button>
              </div>

              {/* Status Signals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AdSense Status Card */}
                <div className="p-4 rounded-xl border border-border/40 bg-card/40 space-y-3">
                  <h5 className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">AdSense Connection</h5>
                  <div className="flex items-center gap-2">
                    {clientId ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                    )}
                    <span className="text-xs font-semibold">
                      {clientId ? "SDK Hook Active" : "Missing Publisher ID"}
                    </span>
                  </div>
                  <p className="text-3xs text-muted-foreground leading-relaxed">
                    Active Client ID: <code className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">{clientId || "None configured"}</code>
                  </p>
                </div>

                {/* GTM Status Card */}
                <div className="p-4 rounded-xl border border-border/40 bg-card/40 space-y-3">
                  <h5 className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Google Tag Manager</h5>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold">GTM Integration Ready</span>
                  </div>
                  <p className="text-3xs text-muted-foreground leading-relaxed">
                    Account: <code className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">GTM-MWSC7GJZ</code>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ad Protection Explanation Card */}
          <Card className="p-6 border-border/50 rounded-2xl relative overflow-hidden bg-gradient-to-r from-teal-500/5 to-accent/5">
            <div className="absolute top-0 right-0 p-3 text-teal-500/5">
              <Sparkles className="h-16 w-16" />
            </div>
            <div className="flex items-center gap-2.5 mb-3 text-teal-600">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
              <h3 className="font-bold text-sm text-foreground">Premium Subscriber Ad-Free Guarantee</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              Platform rules guarantee that subscribers on paid subscription tiers (Pro, Plus, Standard Partners) enjoy a completely ad-free experience. 
              Regardless of the Global Switch, the system automatically bypasses script renders and container loads for paid accounts.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
