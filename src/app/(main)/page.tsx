"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "@/providers/session-provider";
import { Button } from "@/components/ui/button";
import { DASHBOARD_ROUTES } from "@/constants/roles";
import type { Role } from "@/types";
import { EmailVerificationBanner } from "@/components/email-verification-banner";
import {
  ArrowRight,
  Globe,
  Shield,
  Zap,
  Users,
  MessageSquare,
  Search,
  CheckCircle,
  UserPlus,
} from "lucide-react";

const stats = [
  { value: "10K+", label: "Translators" },
  { value: "5K+", label: "Jobs Completed" },
  { value: "2K+", label: "Companies" },
  { value: "50+", label: "Languages" },
];

const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    desc: "Sign up as a translator or company in under a minute. Set up your profile and get started.",
  },
  {
    icon: Search,
    title: "Find or Post Work",
    desc: "Translators browse jobs across 50+ languages. Companies post projects with detailed requirements.",
  },
  {
    icon: CheckCircle,
    title: "Collaborate & Deliver",
    desc: "Apply, communicate, and deliver high-quality translations through our platform.",
  },
];

const features = [
  {
    icon: Globe,
    title: "50+ Languages",
    desc: "From Arabic to Zulu, find translators for any language pair with native-level proficiency.",
  },
  {
    icon: Shield,
    title: "Verified Professionals",
    desc: "Every translator is vetted. Certifications, experience, and ratings are verified before approval.",
  },
  {
    icon: Zap,
    title: "Smart Matching",
    desc: "Our intelligent system matches your project needs with the most qualified translators.",
  },
  {
    icon: MessageSquare,
    title: "Built-in Communication",
    desc: "Discuss project details, ask questions, and collaborate in real-time without leaving the platform.",
  },
  {
    icon: Users,
    title: "Rating System",
    desc: "Transparent ratings and reviews ensure quality accountability for both parties.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    desc: "Protected payment processing with milestone-based releases for complete peace of mind.",
  },
];

export default function HomePage() {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    const userRole = (user.prefs?.role as Role) || "translator";
    return (
      <div>
        <EmailVerificationBanner />
        <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-hero-glow" />
          <div className="relative animate-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              You&apos;re signed in
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight">
              Welcome back,{" "}
              <span className="text-gradient">{user.name}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              You are signed in as a <span className="text-primary font-medium">{userRole}</span>.
              Head to your dashboard to manage your work.
            </p>
            <Link href={DASHBOARD_ROUTES[userRole] || "/"}>
              <Button size="lg" className="mt-8 h-12 px-8 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-base">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

        <div className="relative max-w-4xl mx-auto animate-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8 animate-in animate-in-delay-1">
            <Globe className="h-3.5 w-3.5" />
            The #1 Translation Marketplace
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight animate-in animate-in-delay-2">
            Connect with Top
            <br />
            <span className="text-gradient">Translation Talent</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in animate-in-delay-3">
            Post translation projects, find expert freelance translators, and grow your global reach.
            Tranzlo connects companies with verified language professionals across 50+ languages.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-in animate-in-delay-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all text-base font-semibold">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl border-border/50 hover:bg-accent/50 transition-all text-base">
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center animate-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <p className="text-3xl md:text-4xl font-extrabold text-gradient">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="relative py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/3 rounded-full blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto animate-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4">
              Simple Process
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              How it <span className="text-gradient">Works</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three simple steps to start translating
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative glass-card rounded-2xl p-8 text-center animate-in"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {i + 1}
                    </span>
                  </div>
                  <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto animate-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4">
              Everything You Need
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Built for <span className="text-gradient">Translation</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Powerful features designed for both translators and companies
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-card rounded-2xl p-6 animate-in"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="mb-4 h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                    <Icon className="h-5.5 w-5.5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 border-t border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative animate-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4">
            Get Started Today
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Ready to transform your
            <br />
            <span className="text-gradient">translation workflow?</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of translators and companies already using Tranzlo to connect, collaborate, and deliver exceptional translations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all text-base font-semibold">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl border-border/50 hover:bg-accent/50 transition-all text-base">
                Browse Available Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
