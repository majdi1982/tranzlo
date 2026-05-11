"use client"

import Link from "next/link"
import { Button } from "@/components/atoms/Button"
import { motion } from "framer-motion"
import { ArrowRight, Globe, Shield, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(85,34,226,0.15)_0%,transparent_100%)]" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs font-medium text-primary mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Trusted by 5,000+ teams worldwide
            </span>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 font-outfit">
              Connecting the world <br />
              <span className="bg-premium-gradient bg-clip-text text-transparent">
                one word at a time.
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
              Tranzlo is the enterprise-grade translation marketplace. 
              Bridging language gaps with expert human translators and AI-powered workflows.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Explore Marketplace
              </Button>
            </Link>
          </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-t border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-primary" />}
              title="Global Reach"
              description="Access native translators across 100+ languages and 50+ specialized industries."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Secure Escrow"
              description="PayPal integrated escrow system ensures secure payments and guaranteed quality."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="AI Enhanced"
              description="Boost productivity with AI-assisted translation memory and automated workflows via n8n."
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-8 flex flex-col gap-4"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}
