import React from "react";
import { FileText, Eye, ShieldAlert, Key, HelpCircle, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions | Tranzlo",
  description: "Terms and conditions of service for the Tranzlo translation platform.",
};

export default function TermsConditionsPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 py-20 px-4 sm:px-6 lg:px-8 bg-grid">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-hero-glow pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-left">
        {/* Header section */}
        <div className="text-center mb-16">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-950/50 border border-cyan-500/20 text-primary mb-4 glow-sm">
            <FileText className="h-10 w-10 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500">
            Terms & Conditions
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Please read these terms and conditions of service carefully before accessing or using the Tranzlo translation platform.
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
                <Key className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">1. Account Registration & Security</h2>
                <p className="text-slate-300 leading-relaxed text-sm">
                  To access key marketplace tools and contract matching, users must register for an account as either a Translator (Linguist) or a Company (Employer). You agree to provide accurate, current information during onboarding and maintain the confidentiality of your credentials. Tranzlo is not liable for unauthorized account access resulting from weak credential management.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400 shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">2. Escrow Payment & Project Funding</h2>
                <p className="text-slate-300 leading-relaxed text-sm">
                  All contracted projects must use Tranzlo's secure escrow mechanism. Employers must fund the complete project budget before the translator begins work. Funded amounts are held securely in escrow and released to the translator's account balance upon employer approval of the localized delivery file or auto-release expiration.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">3. Professional Integrity & Disallowed Activities</h2>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Linguists must supply original translation services matching professional standards. Using unedited raw machine translations is strictly prohibited and constitutes a breach of service. Circumventing the platform's payment systems to process off-platform transactions is forbidden and will lead to immediate account suspension.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400 shrink-0">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">4. Dispute Resolutions</h2>
                <p className="text-slate-300 leading-relaxed text-sm">
                  In case of disagreement regarding delivery quality or project specifications, either side can initiate an official Dispute. Tranzlo's operations desk will review project conversations, submitted source/target files, and milestones to resolve the dispute in accordance with our resolution rules.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support and Contact box */}
        <div className="mt-16 text-center border-t border-slate-800 pt-10">
          <p className="text-sm text-slate-400">
            For questions or queries regarding our Terms and Conditions, please contact us:
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
