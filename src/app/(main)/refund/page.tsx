import React from "react";
import { CreditCard, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Refund Policy | Tranzlo",
  description: "Escrow refunds, dispute returns, and subscription cancellation guidelines for Tranzlo users.",
};

export default function RefundPolicyPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 py-20 px-4 sm:px-6 lg:px-8 bg-grid">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-hero-glow pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-left">
        {/* Header section */}
        <div className="text-center mb-16">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-950/50 border border-cyan-500/20 text-primary mb-4 glow-sm">
            <CreditCard className="h-10 w-10 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500">
            Refund Policy
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Our goal is complete transactional security. Read our policy guidelines regarding escrow refunds, disputes, and plan subscriptions.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Last Updated: June 4, 2026</span>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-8">
          {/* Section 1: Escrow Funds */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">1. Escrow Refund Rules</h2>
                <p className="text-slate-300 leading-relaxed text-sm mb-4">
                  Funds deposited into project escrow can be returned under the following conditions:
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span><strong>Mutual Cancellation:</strong> If both company and translator agree to cancel a contract before delivery, 100% of escrow is refunded to the company.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span><strong>Dispute Decision:</strong> If a dispute is raised, our audit team may decide to refund the employer fully or partially based on the project's state.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Plan Subscriptions */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400 shrink-0">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">2. Plan Subscription Billing</h2>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Monthly and annual plan subscriptions (Pro Member, Plus Member, Pro Business, Plus Business) are billed in advance. You can cancel at any time, and you will retain access to your plan features until the end of your billing cycle. We do not offer pro-rated refunds for partially used subscription periods.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support and Contact box */}
        <div className="mt-16 text-center border-t border-slate-800 pt-10">
          <p className="text-sm text-slate-400">
            Need billing assistance or have refund inquiries? Get in touch with our operations team:
          </p>
          <a
            href="mailto:support@tranzlo.net"
            className="mt-3 inline-block text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
          >
            support@tranzlo.net
          </a>
        </div>
      </div>
    </div>
  );
}
