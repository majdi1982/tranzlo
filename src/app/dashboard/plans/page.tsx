"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Sparkles, Zap, Shield, HelpCircle } from "lucide-react";
import type { Role } from "@/types";
import { getServices } from "@/services";

// Plan mappings corresponding to our Appwrite PayPal Webhook PLAN_MAP
const PLANS = {
  translator: (isAnnual: boolean) => [
    {
      name: "Free Member",
      price: "$0",
      period: "forever",
      description: "Basic translating features with default platform fee. Setup is 100% free.",
      features: [
        "20% platform escrow fee",
        "Standard payout release (30 days)",
        "Basic email notifications",
        "Public platform profile",
        "Account setup & preparation: Free"
      ],
      tier: "free",
      buttonText: "Current Plan",
      paypalPlanId: null
    },
    {
      name: "Pro Member",
      price: isAnnual ? "$120" : "$18",
      period: isAnnual ? "year" : "month",
      description: "Great for active translators who want to keep more of their earnings.",
      features: [
        "10% platform escrow fee (50% reduction!)",
        "Up to 5 languages",
        "Automatic payouts enabled",
        "Verified Pro Translator badge",
        "Account setup & preparation: Free"
      ],
      tier: "pro",
      buttonText: isAnnual ? "Subscribe Pro Annual" : "Subscribe Pro Monthly",
      paypalPlanId: isAnnual ? "P-34E03651943893946NIQFS3Y" : "P-6BH643160R158860TNIQF2KQ"
    },
    {
      name: "Plus Member",
      price: isAnnual ? "$200" : "$25",
      period: isAnnual ? "year" : "month",
      description: "Ultimate plan for professional full-time translators and small teams.",
      features: [
        "Only 5% platform escrow fee (75% reduction!)",
        "Add 3 colleagues as a team (No extra fees)",
        "Inherit all Pro features for your team",
        "Featured placement in browse lists",
        "Account setup & preparation: Free"
      ],
      tier: "plus",
      buttonText: isAnnual ? "Upgrade to Plus Annual" : "Upgrade to Plus Monthly",
      paypalPlanId: isAnnual ? "P-8R773786AM2534425NIQFULQ" : "P-6W050275X4975753MNIQFZPQ"
    }
  ],
  company: (isAnnual: boolean) => [
    {
      name: "Free Tier",
      price: "$0",
      period: "forever",
      description: "Standard posting features for businesses.",
      features: [
        "5% project funding escrow fee",
        "Standard email notifications",
        "Up to 3 active job postings",
        "Standard translator search",
        "Account setup & preparation: Free"
      ],
      tier: "free",
      buttonText: "Current Plan",
      paypalPlanId: null
    },
    {
      name: "Pro Business",
      price: "$200",
      period: "year",
      description: "Best for growing organizations and agency localization.",
      features: [
        "2% project funding escrow fee",
        "Unlimited active job postings",
        "Access to verified translators",
        "Add 3 accounts with Translator Pro specs",
        "Account setup & preparation: Free"
      ],
      tier: "pro",
      buttonText: "Subscribe Pro Annual",
      paypalPlanId: "P-8JB63458CY1027604NIQF5FQ"
    },
    {
      name: "Plus Business",
      price: "$300",
      period: "year",
      description: "Designed for enterprise scale localization with zero fees.",
      features: [
        "0% project funding escrow fee (No fees!)",
        "Advanced translator matching filters",
        "Featured job listings (Top of browse)",
        "Add 3 accounts with Translator Plus specs",
        "Account setup & preparation: Free"
      ],
      tier: "plus",
      buttonText: "Upgrade to Plus Annual",
      paypalPlanId: "P-30J14765A4566030ANIQFWDA"
    }
  ]
};

export default function PlansPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [isAnnual, setIsAnnual] = React.useState<boolean>(false);
  const [currentTier, setCurrentTier] = React.useState<string>("free");
  const [fetchingProfile, setFetchingProfile] = React.useState<boolean>(true);
  const [processingPlan, setProcessingPlan] = React.useState<string | null>(null);

  const role = (user?.prefs?.role as Role) || "translator";
  // Pro Member tier maps to pro
  const userPlans = role === "company" ? PLANS.company(isAnnual) : PLANS.translator(isAnnual);

  React.useEffect(() => {
    async function loadCurrentPlan() {
      if (!user?.$id) return;
      try {
        const services = getServices();
        if (role === "translator") {
          const profile = await services.profile.getTranslatorProfile(user.$id);
          if (profile) setCurrentTier(profile.planTier || "free");
        } else {
          const profile = await services.profile.getCompanyProfile(user.$id);
          if (profile) setCurrentTier(profile.planTier || "free");
        }
      } catch (err) {
        console.error("Failed to load user plan:", err);
      } finally {
        setFetchingProfile(false);
      }
    }
    if (user?.$id) {
      loadCurrentPlan();
    } else if (!loading) {
      setFetchingProfile(false);
    }
  }, [user?.$id, role, loading]);

  React.useEffect(() => {
    if (!processingPlan) return;

    const plan = userPlans.find((p: any) => p.tier === processingPlan);
    if (!plan || !plan.paypalPlanId) return;

    const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE || "live";
    const clientId = mode === "live"
      ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
      : (process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID || "AXPRlo7oi-GRgNxmCtjDMJwaKnz1Z2pdrTehZpO4xd_2GPV-m_AeTnacnuZieJatk0pD1R_TOjCMvfT5");
    const containerId = `paypal-sub-container-${processingPlan}`;

    const renderButton = () => {
      const container = document.getElementById(containerId);
      if (!container) return;

      if ((window as any).paypal) {
        container.innerHTML = ""; // Clear existing loading spinner
        (window as any).paypal.Buttons({
          style: {
            shape: "rect",
            color: "blue",
            layout: "vertical",
            label: "subscribe"
          },
          createSubscription: function(data: any, actions: any) {
            return actions.subscription.create({
              plan_id: plan.paypalPlanId,
              custom_id: user?.$id // Pass userId to webhook
            });
          },
          onApprove: function(data: any, actions: any) {
            alert(`🎉 Subscription successful! ID: ${data.subscriptionID}. Your account will be upgraded within a few moments.`);
            setProcessingPlan(null);
            window.location.reload();
          },
          onError: function(err: any) {
            console.error("Subscription Error:", err);
            alert("❌ Payment could not be processed. Please try again.");
            setProcessingPlan(null);
          }
        }).render(`#${containerId}`);
      } else {
        // If script is loading or loaded but paypal object not initialized, retry
        setTimeout(renderButton, 100);
      }
    };

    const scriptId = "paypal-checkout-subscription-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
      script.onload = renderButton;
      document.body.appendChild(script);
    } else {
      // Small timeout to allow React to commit DOM render of container
      setTimeout(renderButton, 100);
    }
  }, [processingPlan, user?.$id, userPlans]);

  const handleSubscribe = (planId: string | null, planTier: string) => {
    if (!planId) return;
    setProcessingPlan(planTier);
  };

  if (loading || fetchingProfile) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 lg:px-8 bg-gradient-to-b from-background to-accent/10">
      <div className="mx-auto max-w-5xl space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tranzlo Membership Tiers</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Upgrade Your Translation Journey
          </h1>
          <p className="text-lg text-muted-foreground">
            {role === "translator" 
              ? "Lower platform fees, support multiple languages, and build your collaborative team."
              : "Zero commission funding, post unlimited jobs, and enable collaborator accounts."
            }
          </p>

          {/* Monthly / Annual Toggle Switch */}
          {role === "translator" && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className={`text-sm font-semibold transition-colors ${!isAnnual ? "text-primary" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-12 h-6 bg-primary/20 rounded-full transition-colors focus:outline-none"
                aria-label="Toggle annual billing"
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-primary transition-transform ${
                    isAnnual ? "translate-x-6" : ""
                  }`}
                />
              </button>
              <span className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${isAnnual ? "text-primary" : "text-muted-foreground"}`}>
                Annual
                <span className="text-[10px] bg-teal-500/20 text-teal-600 px-2 py-0.5 rounded-full font-bold">
                  2 Months Free!
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Current Plan status banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary animate-pulse" />
            <div>
              <p className="text-sm text-muted-foreground font-medium">YOUR CURRENT MEMBERSHIP</p>
              <h3 className="text-lg font-bold text-foreground capitalize">
                {currentTier === "standard" || currentTier === "pro" ? "Pro" : currentTier} Account
              </h3>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Escrow & automatic PayPal billing secured</span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {userPlans.map((plan: any) => {
            const isCurrent = currentTier === plan.tier;
            const isPlus = plan.tier === "plus";

            return (
              <Card 
                key={plan.name} 
                className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-300 ${
                  isCurrent 
                    ? "border-primary ring-2 ring-primary/20 shadow-xl bg-background" 
                    : isPlus 
                      ? "border-primary/30 shadow-md hover:border-primary/50 bg-background" 
                      : "border-border shadow-sm hover:shadow-md bg-background"
                }`}
              >
                {isPlus && (
                  <div className="absolute -top-3.5 right-6 inline-flex items-center gap-1 px-3 py-1 rounded-full text-3xs font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-sm">
                    <Sparkles className="h-2.5 w-2.5" /> Best Value
                  </div>
                )}
                
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-xs min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-3xl font-extrabold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-1">
                  <div className="border-t border-border/50 my-2" />
                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    {plan.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <div className="w-full space-y-3">
                    {isCurrent ? (
                      <Button className="w-full rounded-xl bg-muted text-muted-foreground hover:bg-muted cursor-default" disabled>
                        Active Plan
                      </Button>
                    ) : plan.paypalPlanId ? (
                      <>
                        {processingPlan === plan.tier ? (
                          <div id={`paypal-sub-container-${plan.tier}`} className="w-full min-h-[44px]" />
                        ) : (
                          <Button 
                            className={`w-full rounded-xl shadow-md ${
                              isPlus 
                                ? "bg-primary text-primary-foreground hover:bg-primary/95" 
                                : "variant-outline"
                            }`}
                            onClick={() => handleSubscribe(plan.paypalPlanId, plan.tier)}
                          >
                            {plan.buttonText}
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button className="w-full rounded-xl border border-border" variant="outline" disabled>
                        Basic Lifetime Plan
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Support banner */}
        <div className="text-center pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span>Have questions about Tranzlo Plans?</span>
          </div>
          <Link href="/support" className="text-primary font-semibold hover:underline">
            Contact Support & FAQ
          </Link>
        </div>

      </div>
    </div>
  );
}
