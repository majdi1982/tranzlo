import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Shield, Zap, ArrowRight, Users, Languages } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-20 pb-24">
      <section className="relative overflow-hidden px-4 pt-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(13,148,136,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.5),transparent_45%)]" />
        <div className="container mx-auto grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
              <Languages className="h-4 w-4 text-primary" />
              Phase A foundation is live
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">
              Language operations, built like a product team.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Tranzlo gives companies, translators, and admins one shared system for work,
              payments, and trust.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline">
                  Explore marketplace
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-border/60 bg-background px-4 py-2">Translator workflows</span>
              <span className="rounded-full border border-border/60 bg-background px-4 py-2">Company dashboards</span>
              <span className="rounded-full border border-border/60 bg-background px-4 py-2">Admin oversight</span>
            </div>
          </div>
          <div className="grid gap-4">
            <Card className="bg-background/90">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active translators</p>
                    <p className="text-3xl font-semibold">128</p>
                  </div>
                  <Users className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/90">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Languages covered</p>
                    <p className="text-3xl font-semibold">42</p>
                  </div>
                  <Globe className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/90">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. turnaround</p>
                    <p className="text-3xl font-semibold">2.4h</p>
                  </div>
                  <Zap className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-3">
          <Card className="border-border/60">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Verified expertise</h3>
              <p className="text-muted-foreground">Every translator is vetted for proficiency and cultural nuance.</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Fast assignment flow</h3>
              <p className="text-muted-foreground">Move from request to assignment with fewer handoffs.</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Global reach</h3>
              <p className="text-muted-foreground">Support for 100+ language pairs with native-level accuracy.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid gap-6 rounded-[2rem] border border-border/60 bg-card p-8 shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Why this works</p>
            <h2 className="text-3xl font-semibold">One system for every role.</h2>
            <p className="text-muted-foreground">
              Phase A sets the visual and structural base so the product can scale without each area
              inventing its own layout language.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
              <p className="text-sm text-muted-foreground">For companies</p>
              <p className="mt-2 font-semibold">Post work, track progress, stay in control.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
              <p className="text-sm text-muted-foreground">For translators</p>
              <p className="mt-2 font-semibold">Find assignments, manage tasks, deliver cleanly.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
              <p className="text-sm text-muted-foreground">For admins</p>
              <p className="mt-2 font-semibold">Monitor quality, payments, and trust signals.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
