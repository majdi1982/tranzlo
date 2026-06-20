import React from "react";
import { Shield, Eye, Lock, RefreshCw, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Tranzlo",
  description: "Privacy policy and data protection guidelines for the Tranzlo translation platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 py-20 px-4 sm:px-6 lg:px-8 bg-grid">
      {/* Background glow animations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-hero-glow pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-left">
        {/* Header section */}
        <div className="text-center mb-16">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-950/50 border border-cyan-500/20 text-primary mb-4 glow-sm">
            <Shield className="h-10 w-10 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            At Tranzlo, securing your data and maintaining your privacy is our highest priority. We are committed to protecting your personal information and being completely transparent about how we process it.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Last Updated: May 31, 2026</span>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-8">
          {/* Card 1: Data Collection */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">1. Information We Collect</h2>
                <p className="text-slate-300 leading-relaxed text-sm">
                  We collect only the essential information necessary to deliver and optimize your experience on Tranzlo. This includes basic registration details (name, email address, encrypted password), as well as details received when linking third-party services like Google and LinkedIn to facilitate secure and seamless social logins.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Security & Encryption */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400 shrink-0">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">2. Data Security & Encryption</h2>
                <p className="text-slate-300 leading-relaxed text-sm">
                  All passwords and sensitive user details are stored using state-of-the-art encryption protocols and secured cloud databases (Appwrite Secured DB). We do not share your private data with unauthorized external parties, and we ensure all communication between your browser and our servers is secured and encrypted via modern SSL/TLS certificates.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: User Rights */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">3. User Rights & Data Control</h2>
                <p className="text-slate-300 leading-relaxed text-sm mb-4">
                  You retain absolute ownership and control over your personal data. At any time via your account settings, you can:
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Modify or update your email address and password.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Link or unlink Google and LinkedIn authentication methods.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>Permanently delete your account and all associated records from our servers.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 4: AdSense & Third-Party Advertising */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400 shrink-0">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-3">4. Google AdSense & Third-Party Advertising</h2>
                <p className="text-slate-300 leading-relaxed text-sm mb-4">
                  We use Google AdSense to serve advertisements on our platform. To ensure compliance with Google's program policies, please note the following disclosures:
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to our website or other websites on the Internet.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visits to our site and/or other sites on the Internet.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>You can easily opt out of personalized advertising by visiting Google's <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">www.aboutads.info</a>.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Support and Contact box */}
        <div className="mt-16 text-center border-t border-slate-800 pt-10">
          <p className="text-sm text-slate-400">
            If you have any questions or feedback regarding our privacy policies, please reach out to our team directly:
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
