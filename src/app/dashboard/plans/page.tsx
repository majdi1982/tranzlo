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
  translator: [
    {
      name: "Free Member",
      price: "$0",
      period: "forever",
      description: "Basic translating features with default platform fee.",
      features: [
        "20% platform escrow fee",
        "Standard payout release (30 days)",
        "Basic email notifications",
        "Public platform profile"
      ],
      tier: "free",
      buttonText: "Current Plan",
      paypalPlanId: null
    },
    {
      name: "Standard Member",
      price: "$19",
      period: "month",
      description: "Great for active translators who want to keep more of their earnings.",
      features: [
        "10% platform escrow fee (50% reduction!)",
        "Fast payout release (30 days automated)",
        "SMTP and WhatsApp notifications",
        "Direct PayPal Payouts enabled",
        "Verified Translator badge"
      ],
      tier: "standard",
      buttonText: "Subscribe Standard",
      paypalPlanId: "P-1FA07072XD6828721NHNGB6I" // Monthly Standard Plan ID
    },
    {
      name: "Plus Member",
      price: "$49",
      period: "month",
      description: "Ultimate plan for professional full-time translators.",
      features: [
        "Only 5% platform escrow fee (75% reduction!)",
        "SMTP, Email & instant WhatsApp notifications",
        "Premium support & priority job matching",
        "Direct automated PayPal Payouts",
        "Featured placement in browse lists",
        "Verified Plus Badge"
      ],
      tier: "plus",
      buttonText: "Upgrade to Plus",
      paypalPlanId: "P-5H654170A9572811WNHNGK3Q" // Monthly Plus Plan ID
    }
  ],
  company: [
    {
      name: "Free Tier",
      price: "$0",
      period: "forever",
      description: "Standard posting features for businesses.",
      features: [
        "5% project funding escrow fee",
        "Standard email notifications",
        "Up to 3 active job postings",
        "Standard translator search"
      ],
      tier: "free",
      buttonText: "Current Plan",
      paypalPlanId: null
    },
    {
      name: "Standard Business",
      price: "$99",
      period: "month",
      description: "Best for growing organizations and agency localization.",
      features: [
        "2% project funding escrow fee",
        "SMTP & WhatsApp notifications",
        "Unlimited active job postings",
        "Access to verified translators",
        "Priority support"
      ],
      tier: "standard",
      buttonText: "Subscribe Standard",
      paypalPlanId: "P-69A23890DT383361KNHN26ZQ" // Monthly Standard Plan ID
    },
    {
      name: "Plus Corporate",
      price: "$249",
      period: "month",
      description: "Designed for enterprise scale localization with zero fees.",
      features: [
        "0% project funding escrow fee (No fees!)",
        "SMTP, Email & instant WhatsApp notifications",
        "Premium dedicated account manager",
        "Advanced translator matching filters",
        "Featured job listings (Top of browse)",
        "Verified Corporate Badge"
      ],
      tier: "plus",
      buttonText: "Upgrade to Plus",
      paypalPlanId: "P-7R9234853W7319009NHN3A2I" // Monthly Plus Plan ID
    }
  ]
};

export default function PlansPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [currentTier, setCurrentTier] = React.useState<string>("free");
  const [fetchingProfile, setFetchingProfile] = React.useState<boolean>(true);
  const [processingPlan, setProcessingPlan] = React.useState<string | null>(null);

  const role = (user?.prefs?.role as Role) || "translator";
  const userPlans = role === "company" ? PLANS.company : PLANS.translator;

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
    }
  }, [user?.$id, role]);

  const handleSubscribe = (planId: string | null, planTier: string) => {
    if (!planId) return;
    setProcessingPlan(planTier);

    // Initialize PayPal Subscription Button overlay dynamically
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID || "AXPRlo7oi-GRgNxmCtjDMJwaKnz1Z2pdrTehZpO4xd_2GPV-m_AeTnacnuZieJatk0pD1R_TOjCMvfT5";
    
    // Inject PayPal subscription overlay dynamically or redirect to custom portal
    const containerId = `paypal-sub-container-${planTier}`;
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = ""; // Clear existing
      
      const scriptId = "paypal-checkout-subscription-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      
      const renderButton = () => {
        if ((window as any).paypal) {
          (window as any).paypal.Buttons({
            style: {
              shape: "rect",
              color: "blue",
              layout: "vertical",
              label: "subscribe"
            },
            createSubscription: function(data: any, actions: any) {
              return actions.subscription.create({
                plan_id: planId,
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
        }
      };

      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
        script.onload = renderButton;
        document.body.appendChild(script);
      } else {
        renderButton();
      }
    }
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
              ? "Lower platform fees, get direct PayPal Payouts, and boost your job application match rate."
              : "Zero commission funding, unlimited job listings, and premium dedicated support."
            }
          </p>
        </div>

        {/* Current Plan status banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary animate-pulse" />
            <div>
              <p className="text-sm text-muted-foreground font-medium">YOUR CURRENT MEMBERSHIP</p>
              <h3 className="text-lg font-bold text-foreground capitalize">
                {currentTier} Account
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
