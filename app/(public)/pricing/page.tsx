"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [audience, setAudience] = useState<"translator" | "company">("translator");

  const translatorPlans = [
    { name: "Free", price: "0", features: ["Basic Job Access", "Profile Page", "Standard Payouts"], cta: "Start Free" },
    { name: "Pro", price: "19", features: ["Priority Job Access", "Verified Badge", "Custom Rates", "Fast Payouts"], popular: true, cta: "Start Free Trial" },
    { name: "Premium", price: "39", features: ["Top Search Ranking", "Personal Branding", "Analytics", "Direct Support"], cta: "Start Free Trial" },
  ];

  const companyPlans = [
    { name: "Basic", price: "49", features: ["Post 5 Jobs/mo", "Direct Messaging", "Standard Support"], cta: "Start Free Trial" },
    { name: "Pro", price: "99", features: ["Unlimited Jobs", "Team Collaboration", "Advanced Filtering", "Priority Support"], popular: true, cta: "Start Free Trial" },
    { name: "Enterprise", price: "Custom", features: ["Dedicated Manager", "API Access", "SSO", "Custom Terms"], cta: "Contact Sales" },
  ];

  const activePlans = audience === "translator" ? translatorPlans : companyPlans;

  return (
    <div className="container mx-auto px-4 py-24 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold md:text-6xl">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose the plan that fits your goals. No hidden fees, cancel anytime.
        </p>
      </div>

      {/* Audience Toggle */}
      <div className="flex justify-center">
        <div className="bg-muted p-1 rounded-full flex gap-1">
          <button
            onClick={() => setAudience("translator")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all",
              audience === "translator" ? "bg-background shadow-sm" : "hover:text-primary"
            )}
          >
            I am a Translator
          </button>
          <button
            onClick={() => setAudience("company")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all",
              audience === "company" ? "bg-background shadow-sm" : "hover:text-primary"
            )}
          >
            I am a Company
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-8 md:grid-cols-3">
        {activePlans.map((plan) => (
          <Card key={plan.name} className={cn(
            "relative flex flex-col transition-all hover:shadow-xl",
            plan.popular ? "border-primary shadow-lg scale-105 z-10" : ""
          )}>
            {plan.popular && (
              <div className="absolute top-0 right-0 left-0 -translate-y-1/2 flex justify-center">
                <span className="bg-primary text-primary-foreground text-xs font-bold uppercase px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-bold">
                  {plan.price !== "Custom" ? `$${plan.price}` : plan.price}
                </span>
                {plan.price !== "Custom" && <span className="text-muted-foreground">/mo</span>}
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full h-11" variant={plan.popular ? "default" : "outline"}>
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ Placeholder */}
      <div className="max-w-3xl mx-auto space-y-8 pt-12">
        <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-card">
            <h4 className="font-bold">Can I switch plans later?</h4>
            <p className="text-sm text-muted-foreground mt-2">
              Yes, you can upgrade or downgrade your plan at any time from your settings.
            </p>
          </div>
          <div className="p-6 rounded-xl border bg-card">
            <h4 className="font-bold">Is there a free trial?</h4>
            <p className="text-sm text-muted-foreground mt-2">
              All paid plans come with a 30-day free trial. No credit card required to start.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
