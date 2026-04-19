import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Languages, ShieldCheck, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { features, highlights, pricingCards, stats } from "@/lib/site-content";

export default function LandingPage() {
  return (
    <div className="pb-20">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_26%)]" />
        <div className="container mx-auto grid gap-14 px-4 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
              <Languages className="h-4 w-4 text-primary" />
              Live platform foundation for translators, companies, and admins
            </div>
            <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
              A translation marketplace built like production software.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Tranzlo connects hiring teams and translators with role-specific onboarding, billing,
              moderation, and support workflows ready for live deployment.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg">
                  Start now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline">Explore marketplace</Button>
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <Card key={item.label} className="border-border/60 bg-background/80">
                  <CardContent className="p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-sm font-medium">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {highlights.map((item) => (
              <Card key={item.title} className="border-border/60 bg-background/85">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "Translator onboarding", icon: Users, text: "Profiles, language pairs, CV upload, and verification." },
            { title: "Company hiring", icon: BriefcaseBusiness, text: "Post jobs, review applicants, and manage requests." },
            { title: "Billing control", icon: Wallet, text: "PayPal subscriptions, plan gating, and billing history." },
            { title: "Trust layer", icon: ShieldCheck, text: "Admin moderation, verification queue, and tickets." },
          ].map((card) => (
            <Card key={card.title} className="border-border/60">
              <CardContent className="space-y-4 p-6">
                <card.icon className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="grid gap-6 rounded-[2rem] border border-border/60 bg-card p-8 shadow-sm lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Built for live ops</p>
            <h2 className="text-3xl font-semibold">One system for the entire workflow.</h2>
            <p className="text-muted-foreground">
              The platform keeps public marketing, role-based onboarding, job flows, billing, and support
              in one maintainable structure.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((item) => (
              <div key={item} className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm font-medium">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Pricing preview</p>
              <h2 className="text-3xl font-semibold">Simple roles, clear plans.</h2>
            </div>
            <Link href="/pricing" className="text-sm font-medium text-primary">View all plans</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pricingCards.map((plan) => (
              <Card key={plan.title} className="border-border/60 bg-background/90">
                <CardContent className="space-y-4 p-6">
                  <p className="text-sm text-muted-foreground">{plan.title}</p>
                  <p className="text-4xl font-semibold">{plan.price}</p>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

