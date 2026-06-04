import React from "react";
import { Cookie, Eye, ShieldCheck, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Cookie Policy | Tranzlo",
  description: "Transparency guidelines regarding cookies and local storage items on Tranzlo.",
};

export default function CookiePolicyPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 py-20 px-4 sm:px-6 lg:px-8 bg-grid">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-hero-glow pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-left">
        {/* Header section */}
        <div className="text-center mb-16">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-950/50 border border-cyan-500/20 text-primary mb-4 glow-sm">
            <Cookie className="h-10 w-10 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500">
            Cookie Policy
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Learn more about how and why we use cookies, local storage items, and cache parameters to deliver a secure translation experience.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Last Updated: June 4, 2026</span>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Cookie className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">1. What are Cookies & Local Storage?</h2>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Cookies are small pieces of data stored on your browser to recognize actions and settings across pages. Tranzlo also utilizes LocalStorage parameters to retain interface theme preferences and security tokens. These storage configurations are safe and do not contain malware.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400 shrink-0">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">2. Essential Cookies We Use</h2>
                <p className="text-slate-300 leading-relaxed text-sm">
                  We use cookies for core platform functions, such as keeping you authenticated throughout your session (Appwrite session cookies), managing payment workflows (PayPal tokens), and persisting your cookie selection preferences. Disabling these essential cookies may impair core website operations.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">3. Managing Your Consent Preferences</h2>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Our cookie banner gives you full power to either Accept or Decline analytics cookies. You can also block or clear cookies globally by adjusting your web browser settings. Note that blocking all cookies may limit your ability to sign in and complete payments on our platform.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support and Contact box */}
        <div className="mt-16 text-center border-t border-slate-800 pt-10">
          <p className="text-sm text-slate-400">
            For questions or requests about data privacy and cookie usage, contact our data protection desk:
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
