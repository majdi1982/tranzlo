"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Sparkles, Zap, Shield, HelpCircle, CreditCard } from "lucide-react";
import type { Role } from "@/types";
import { getServices } from "@/services";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAccount } from "@/lib/appwrite";

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
      buttonText: "Current Plan"
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
      buttonText: isAnnual ? "Subscribe Pro Annual" : "Subscribe Pro Monthly"
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
      buttonText: isAnnual ? "Upgrade to Plus Annual" : "Upgrade to Plus Monthly"
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
      buttonText: "Current Plan"
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
      buttonText: "Subscribe Pro Annual"
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
      buttonText: "Upgrade to Plus Annual"
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
  const [promoCode, setPromoCode] = React.useState<string>("");
  const [submittingPromo, setSubmittingPromo] = React.useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = React.useState<any>(null);
  const [appliedPromo, setAppliedPromo] = React.useState<any>(null);
  const [promoError, setPromoError] = React.useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = React.useState<string | null>(null);

  const role = (user?.prefs?.role as Role) || "translator";
  // Pro Member tier maps to pro
  const userPlans = role === "company" ? PLANS.company(isAnnual) : PLANS.translator(isAnnual);

  React.useEffect(() => {
    if (!loading && user) {
      if (role === "admin" || role === "staff") {
        router.replace(role === "admin" ? "/dashboard/admin" : "/dashboard/staff");
      }
    }
  }, [user, role, loading, router]);

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
    if (!processingPlan || !isCheckoutOpen) return;

    // If 100% free discount is active, do not render PayPal
    if (appliedPromo && (appliedPromo.discountType === "free" || appliedPromo.discountPercent === 100)) {
      return;
    }

    const plan = userPlans.find((p: any) => p.tier === processingPlan);
    if (!plan) return;

    const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE || "live";
    const clientId = mode === "live"
      ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
      : (process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID || "AXPRlo7oi-GRgNxmCtjDMJwaKnz1Z2pdrTehZpO4xd_2GPV-m_AeTnacnuZieJatk0pD1R_TOjCMvfT5");
    const containerId = `paypal-sub-container-${processingPlan}`;

    const renderButton = () => {
      const container = document.getElementById(containerId);
      if (!container) {
        setTimeout(renderButton, 50);
        return;
      }

      if ((window as any).paypal) {
        container.innerHTML = ""; // Clear existing loading spinner
        
        let finalPrice = parseFloat(plan.price.replace("$", ""));
        if (appliedPromo && appliedPromo.discountType === "percentage" && appliedPromo.discountPercent < 100) {
          finalPrice = parseFloat((finalPrice * (1 - appliedPromo.discountPercent / 100)).toFixed(2));
        }

        const customId = `plan_upgrade:${user?.$id}:${role}:${plan.tier}:${appliedPromo?.code || 'none'}`;

        (window as any).paypal.Buttons({
          style: {
            shape: "rect",
            color: "blue",
            layout: "vertical",
            label: "pay"
          },
          createOrder: function(data: any, actions: any) {
            return actions.order.create({
              purchase_units: [{
                custom_id: customId,
                description: `Upgrade to ${plan.name} (${isAnnual ? "Annual" : "Monthly"})`,
                amount: {
                  currency_code: "USD",
                  value: finalPrice.toFixed(2)
                }
              }]
            });
          },
          onApprove: function(data: any, actions: any) {
            return actions.order.capture().then(function(details: any) {
              alert(`🎉 Payment successful! Order ID: ${details.id}. Your account will be upgraded within a few moments.`);
              setProcessingPlan(null);
              setIsCheckoutOpen(false);
              window.location.reload();
            });
          },
          onError: function(err: any) {
            console.error("Payment Error Data:", err);
            alert("❌ Payment could not be processed. Please check the console for details and try again.");
            setProcessingPlan(null);
            setIsCheckoutOpen(false);
          }
        }).render(`#${containerId}`);
      } else {
        // If script is loading or loaded but paypal object not initialized, retry
        setTimeout(renderButton, 100);
      }
    };

    const scriptId = "paypal-sdk-script-capture";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script && !(window as any).paypal) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
      script.onload = renderButton;
      document.body.appendChild(script);
    } else {
      // Small timeout to allow React to commit DOM render of container
      setTimeout(renderButton, 100);
    }
  }, [processingPlan, isCheckoutOpen, appliedPromo, user?.$id, userPlans]);

  const handleSubscribe = (planTier: string) => {
    const plan = userPlans.find((p: any) => p.tier === planTier);
    if (!plan) return;
    setSelectedPlan(plan);
    setProcessingPlan(planTier);
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError(null);
    setPromoSuccess(null);
    setIsCheckoutOpen(true);
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setSubmittingPromo(true);
    setPromoError(null);
    setPromoSuccess(null);
    try {
      const account = getAccount();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      try {
        const jwtObj = await account.createJWT();
        if (jwtObj?.jwt) {
          headers["Authorization"] = `Bearer ${jwtObj.jwt}`;
        }
      } catch (jwtErr) {
        console.warn("Failed to generate JWT, falling back to session cookie:", jwtErr);
      }

      const res = await fetch("/api/promo", {
        method: "POST",
        headers,
        body: JSON.stringify({ code: promoCode.trim(), planTier: selectedPlan?.tier, action: "validate" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to validate code.");
      }
      
      setAppliedPromo(data);
      setPromoSuccess(`Code applied: ${data.discountType === "percentage" ? `${data.discountPercent}% Off` : `${data.durationMonths} Months Free`}`);
    } catch (err: any) {
      setPromoError(err.message);
      setAppliedPromo(null);
    } finally {
      setSubmittingPromo(false);
    }
  };

  const handleRedeemFreePromo = async () => {
    if (!appliedPromo) return;
    setSubmittingPromo(true);
    setPromoError(null);
    try {
      const account = getAccount();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      try {
        const jwtObj = await account.createJWT();
        if (jwtObj?.jwt) {
          headers["Authorization"] = `Bearer ${jwtObj.jwt}`;
        }
      } catch (jwtErr) {
        console.warn("Failed to generate JWT:", jwtErr);
      }

      const res = await fetch("/api/promo", {
        method: "POST",
        headers,
        body: JSON.stringify({ code: appliedPromo.code, planTier: selectedPlan?.tier, action: "redeem" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to redeem code.");
      }
      alert(`🎉 ${data.message}`);
      window.location.reload();
    } catch (err: any) {
      setPromoError(err.message);
    } finally {
      setSubmittingPromo(false);
    }
  };

  if (loading || fetchingProfile) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isCheckoutOpen && selectedPlan) {
    const originalPriceNum = parseFloat(selectedPlan.price.replace("$", ""));
    const discountVal = appliedPromo ? (originalPriceNum * (appliedPromo.discountPercent / 100)) : 0;
    const finalPriceVal = originalPriceNum - discountVal;

    return (
      <div className="min-h-screen py-12 px-6 lg:px-8 bg-gradient-to-b from-background to-accent/10">
        <div className="mx-auto max-w-3xl space-y-8 animate-in duration-300">
          {/* Back button */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              className="text-xs font-bold flex items-center gap-1 bg-background border border-border/40 hover:bg-muted"
              onClick={() => {
                setIsCheckoutOpen(false);
                setProcessingPlan(null);
                setSelectedPlan(null);
                setAppliedPromo(null);
              }}
            >
              ← Back to plans
            </Button>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-3xs font-semibold bg-primary/10 text-primary">
              <Shield className="h-3 w-3" />
              <span>Secure Checkout</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Plan Info */}
            <div className="space-y-6">
              <Card className="rounded-2xl border-border/50 bg-card shadow-lg p-6 space-y-4">
                <div>
                  <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Selected Plan</span>
                  <h3 className="text-xl font-bold mt-2 text-foreground">{selectedPlan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{selectedPlan.description}</p>
                </div>

                <div className="border-t border-border/50 pt-4 space-y-3">
                  <h4 className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Plan Features:</h4>
                  <ul className="space-y-2 text-2xs text-muted-foreground">
                    {selectedPlan.features.map((feat: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Price summary box */}
              <Card className="rounded-2xl border-border/50 bg-primary/5 p-6 space-y-3">
                <h4 className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Pricing Summary</h4>
                <div className="flex justify-between text-xs font-medium text-foreground">
                  <span>Regular Price:</span>
                  <span>{selectedPlan.price}/{selectedPlan.period}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-xs font-medium text-emerald-500">
                    <span>Discount Code ({appliedPromo.code}):</span>
                    <span>-{appliedPromo.discountType === "percentage" ? `${appliedPromo.discountPercent}%` : "100%"} (-${discountVal.toFixed(2)})</span>
                  </div>
                )}
                <div className="border-t border-border/50 pt-3 flex justify-between text-sm font-bold text-foreground">
                  <span>Total Due Now:</span>
                  <span>${finalPriceVal.toFixed(2)}/{selectedPlan.period}</span>
                </div>
              </Card>
            </div>

            {/* Right Column: Checkout actions */}
            <div className="space-y-6">
              {/* Promo box */}
              <Card className="rounded-2xl border-border/50 bg-card shadow-lg p-6 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground">Promo / Discount Code</h4>
                  <p className="text-4xs text-muted-foreground">Apply coupon codes to discount subscription prices or unlock free months.</p>
                </div>
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="e.g. DISCOUNT50"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="h-10 text-xs bg-background border-border/60 rounded-xl uppercase"
                    required
                    disabled={submittingPromo}
                  />
                  <Button 
                    type="submit" 
                    className="h-10 rounded-xl px-5 text-xs font-bold shrink-0 bg-primary hover:bg-primary/90"
                    disabled={submittingPromo}
                  >
                    {submittingPromo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                  </Button>
                </form>
                {promoError && (
                  <p className="text-3xs text-rose-500 font-bold flex items-center gap-1">❌ {promoError}</p>
                )}
                {promoSuccess && (
                  <p className="text-3xs text-emerald-500 font-bold flex items-center gap-1">✅ {promoSuccess}</p>
                )}
              </Card>

              {/* Payment Box */}
              <Card className="rounded-2xl border-border/50 bg-card shadow-lg p-6 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground">Complete Activation</h4>
                  <p className="text-4xs text-muted-foreground">Finish your upgrade through secure PayPal or directly via coupon.</p>
                </div>

                {appliedPromo && (appliedPromo.discountType === "free" || appliedPromo.discountPercent === 100) ? (
                  /* 100% free code -> just activate instantly */
                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center space-y-1">
                      <Sparkles className="h-5 w-5 text-emerald-500 mx-auto animate-pulse" />
                      <p className="text-3xs font-bold text-emerald-500">Your plan is 100% Free for {appliedPromo.durationMonths} months!</p>
                      <p className="text-4xs text-muted-foreground">No card or payment details required.</p>
                    </div>
                    <Button 
                      onClick={handleRedeemFreePromo}
                      className="w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold"
                      disabled={submittingPromo}
                    >
                      {submittingPromo ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                      Activate My Free Plan
                    </Button>
                  </div>
                ) : (
                  /* Regular PayPal payment */
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 justify-center py-1 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                      <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-3xs font-bold text-blue-500">Pay securely with Credit Card or PayPal</span>
                    </div>

                    <div id={`paypal-sub-container-${selectedPlan.tier}`} className="w-full min-h-[150px] bg-accent/10 rounded-xl flex items-center justify-center border border-dashed border-border/50 p-4">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-4xs text-muted-foreground font-medium">Initializing secure PayPal gateway...</span>
                      </div>
                    </div>

                    <p className="text-4xs text-center text-muted-foreground flex items-center justify-center gap-1">
                      <Shield className="h-3 w-3 text-primary" />
                      <span>Secure billing. Cancel at any time via PayPal.</span>
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
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
                    ) : plan.price !== "$0" ? (
                      <Button 
                        className={`w-full rounded-xl shadow-md ${
                          isPlus 
                            ? "bg-primary text-primary-foreground hover:bg-primary/95" 
                            : "variant-outline"
                        }`}
                        onClick={() => handleSubscribe(plan.tier)}
                      >
                        {plan.buttonText}
                      </Button>
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
