"use client";

import * as React from "react";
import Link from "next/link";
import { Check, HelpCircle, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FAQS = [
  {
    q: "How does the escrow system work?",
    a: "Escrow secures payments for both sides. Companies fund the project budget upfront, and Tranzlo holds it. Once the translator delivers the work and the company approves it, the system releases the funds automatically."
  },
  {
    q: "Can I upgrade or downgrade my plan at any time?",
    a: "Yes, you can modify your subscription plan at any time from your Account Settings. If you upgrade, the change is instant; if you downgrade, the new limits apply at the start of your next billing cycle."
  },
  {
    q: "Are there any hidden setup or implementation fees?",
    a: "Absolutely not. Setup and profile preparation are 100% free on all plans. The only fees are the transparent platform escrow commissions listed in the pricing tiers."
  },
  {
    q: "What payment methods do you support?",
    a: "We support major credit/debit cards and PayPal for instant, secure subscription activation and project funding deposits."
  }
];

export default function PublicPricingPage() {
  const [role, setRole] = React.useState<"translator" | "company">("translator");
  const [isAnnual, setIsAnnual] = React.useState(false);

  const translatorPlans = [
    {
      name: "Free Member",
      price: "$0",
      period: "forever",
      description: "Basic translating features with default platform fee. Setup is 100% free.",
      features: [
        "20% platform escrow fee",
        "Up to 2 active languages",
        "Standard payout release (30 days)",
        "Public platform profile",
        "Account setup & preparation: Free"
      ],
      cta: "Get Started",
      link: "/signup?role=translator",
      highlighted: false
    },
    {
      name: "Pro Member",
      price: isAnnual ? "$10" : "$18",
      period: "month",
      description: "Great for active translators who want to keep more of their earnings.",
      features: [
        "10% platform escrow fee (50% reduction!)",
        "Up to 5 languages",
        "Automatic payouts enabled",
        "Verified Pro Translator badge",
        "Account setup & preparation: Free"
      ],
      cta: "Subscribe Pro",
      link: "/signup?role=translator",
      highlighted: true
    },
    {
      name: "Plus Member",
      price: isAnnual ? "$16" : "$25",
      period: "month",
      description: "Ultimate plan for professional full-time translators and small teams.",
      features: [
        "Only 5% platform escrow fee (75% reduction!)",
        "Add 3 colleagues as a team (No extra fees)",
        "Inherit all Pro features for your team",
        "Featured placement in browse lists",
        "Account setup & preparation: Free"
      ],
      cta: "Upgrade to Plus",
      link: "/signup?role=translator",
      highlighted: false
    }
  ];

  const companyPlans = [
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
      cta: "Create Account",
      link: "/signup?role=company",
      highlighted: false
    },
    {
      name: "Pro Business",
      price: isAnnual ? "$16" : "$20",
      period: "month",
      description: "Best for growing organizations and agency localization.",
      features: [
        "2% project funding escrow fee",
        "Unlimited active job postings",
        "Access to verified translators",
        "Add 3 accounts with Translator Pro specs",
        "Account setup & preparation: Free"
      ],
      cta: "Get Pro Business",
      link: "/signup?role=company",
      highlighted: true
    },
    {
      name: "Plus Business",
      price: isAnnual ? "$25" : "$30",
      period: "month",
      description: "Designed for enterprise scale localization with zero fees.",
      features: [
        "0% project funding escrow fee (No fees!)",
        "Advanced translator matching filters",
        "Featured job listings (Top of browse)",
        "Add 3 accounts with Translator Plus specs",
        "Account setup & preparation: Free"
      ],
      cta: "Get Plus Business",
      link: "/signup?role=company",
      highlighted: false
    }
  ];

  const currentPlans = role === "translator" ? translatorPlans : companyPlans;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 py-24 px-4 sm:px-6 lg:px-8 bg-grid">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-hero-glow pointer-events-none" />

      <div className="relative max-w-6xl mx-auto space-y-16">
        
        {/* Header Title Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500">
            Choose the perfect plan
          </h1>
          <p className="text-lg text-slate-400">
            Flexible features and platform fee reductions designed to support both independent linguists and scaling enterprise companies.
          </p>
        </div>

        {/* Plan & Billing Controls Toggle */}
        <div className="flex flex-col items-center gap-6">
          {/* Role Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
            <button
              onClick={() => setRole("translator")}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                role === "translator"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              For Translators
            </button>
            <button
              onClick={() => setRole("company")}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                role === "company"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              For Companies
            </button>
          </div>

          {/* Billing Switch */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${!isAnnual ? "text-slate-200" : "text-slate-400"}`}>Monthly Billing</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative h-6 w-11 rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                isAnnual ? "bg-cyan-600" : "bg-slate-800"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  isAnnual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnual ? "text-slate-200" : "text-slate-400"}`}>
              Annual Billing
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-3xs font-bold rounded">
                Save 20%
              </Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {currentPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col justify-between p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                plan.highlighted
                  ? "bg-slate-900/60 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                  : "bg-slate-900/20 border-slate-800 hover:border-slate-700"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-4xs font-bold uppercase tracking-widest bg-cyan-600 text-white shadow-md">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{plan.name}</h3>
                  <p className="mt-2 text-xs text-slate-400 min-h-[32px] leading-relaxed">{plan.description}</p>
                </div>

                <div className="flex items-baseline text-slate-100">
                  <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                  {plan.period !== "forever" && (
                    <span className="ml-1 text-sm font-semibold text-slate-400">/{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3.5 text-xs text-slate-300">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Button
                  asChild
                  className={`w-full rounded-xl py-3 font-semibold text-xs shadow-md transition-all ${
                    plan.highlighted
                      ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50"
                  }`}
                >
                  <Link href={plan.link}>
                    {plan.cta}
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Block */}
        <div className="border border-slate-800 rounded-2xl p-6 md:p-8 bg-slate-900/20 backdrop-blur-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              Detailed Platform Tiers Comparison
            </h3>
            <p className="text-xs text-slate-400">Detailed overview comparing platform escrow models and matches.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4 font-semibold">Features & Fees</th>
                  <th className="py-3 px-4 font-semibold">Free Plan</th>
                  <th className="py-3 px-4 font-semibold">Pro Tier</th>
                  <th className="py-3 px-4 font-semibold">Plus Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                <tr>
                  <td className="py-3.5 px-4 font-semibold">Linguist Escrow Fee</td>
                  <td className="py-3.5 px-4">20% commission</td>
                  <td className="py-3.5 px-4 text-cyan-400 font-bold">10% commission</td>
                  <td className="py-3.5 px-4 text-cyan-400 font-bold">5% commission</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold">Employer Escrow Fee</td>
                  <td className="py-3.5 px-4">5% fee</td>
                  <td className="py-3.5 px-4 text-cyan-400 font-bold">2% fee</td>
                  <td className="py-3.5 px-4 text-cyan-400 font-bold">0% fee (Free!)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold">Working Language Cap</td>
                  <td className="py-3.5 px-4">Max 2 languages</td>
                  <td className="py-3.5 px-4">Max 5 languages</td>
                  <td className="py-3.5 px-4 font-bold text-cyan-400">Max 10 languages</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold">Payout Clearance</td>
                  <td className="py-3.5 px-4">30-day security hold</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">Instant Automatic Payout</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">Instant Automatic Payout</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold">Collaborators / Seats</td>
                  <td className="py-3.5 px-4">Single user only</td>
                  <td className="py-3.5 px-4">Single user only</td>
                  <td className="py-3.5 px-4">Up to 3 team members</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-1">
            <HelpCircle className="h-8 w-8 text-cyan-400 mx-auto mb-2 opacity-80" />
            <h3 className="text-xl font-bold text-slate-100">Pricing FAQs</h3>
            <p className="text-xs text-slate-400">Find answers to common questions about our billing and subscription tiers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQS.map((faq, index) => (
              <div key={index} className="p-5 border border-slate-800 rounded-xl bg-slate-900/30">
                <h4 className="font-bold text-sm text-slate-100 mb-2">{faq.q}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
