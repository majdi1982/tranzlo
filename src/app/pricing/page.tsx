"use client"

import React, { useState } from "react"
import { Button } from "@/components/atoms/Button"
import { Check, Info } from "lucide-react"
import { motion } from "framer-motion"

const PLANS = [
  {
    name: "Translator Standard",
    monthlyId: "P-1FA07072XD6828721NHNGB6I",
    annualId: "P-67S23580XX424023HNHN3PVA",
    price: { monthly: 15, annual: 120 },
    features: ["Access to basic projects", "Standard support", "Translation memory (1GB)", "10 project bids/month"],
  },
  {
    name: "Translator Plus",
    monthlyId: "P-5H654170A9572811WNHNGK3Q",
    annualId: "P-2YT069538P2060108NHN3OZA",
    price: { monthly: 29, annual: 240 },
    popular: true,
    features: ["Unlimited project bids", "Priority support", "Translation memory (10GB)", "AI suggestions (Gemini)", "Verified profile badge"],
  },
  {
    name: "Professional Plus",
    monthlyId: "P-7R9234853W7319009NHN3A2I",
    annualId: "P-2WR17344M29329341NHN3NPI",
    price: { monthly: 59, annual: 500 },
    features: ["Enterprise project access", "Dedicated account manager", "Unlimited storage", "API Access", "Team collaboration tools"],
  }
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")

  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-6 text-center mb-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 font-outfit">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground mb-10">Choose the plan that fits your professional needs.</p>
        
        {/* Billing Switch */}
        <div className="flex items-center justify-center gap-4">
          <span className={billingCycle === "monthly" ? "text-foreground font-medium" : "text-muted-foreground"}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
            className="w-14 h-7 rounded-full bg-white/[0.05] border border-white/[0.1] relative p-1 transition-colors"
          >
            <motion.div 
              animate={{ x: billingCycle === "monthly" ? 0 : 28 }}
              className="w-5 h-5 rounded-full bg-primary"
            />
          </button>
          <span className={billingCycle === "annual" ? "text-foreground font-medium" : "text-muted-foreground"}>
            Annual <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full ml-1">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, index) => (
          <motion.div 
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card p-8 flex flex-col relative ${plan.popular ? "border-primary/50 ring-1 ring-primary/20" : ""}`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-8">
              <span className="text-4xl font-bold">${billingCycle === "monthly" ? plan.price.monthly : Math.round(plan.price.annual / 12)}</span>
              <span className="text-muted-foreground ml-1">/mo</span>
              {billingCycle === "annual" && (
                <p className="text-xs text-muted-foreground mt-1">Billed ${plan.price.annual} yearly</p>
              )}
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button variant={plan.popular ? "primary" : "secondary"} className="w-full">
              Get Started
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
