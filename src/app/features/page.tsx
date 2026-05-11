"use client"

import React from "react"
import { motion } from "framer-motion"
import { Zap, Shield, Cpu, Users, BarChart, Globe } from "lucide-react"

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Matching",
    description: "Our AI-powered engine matches your project with the best native translators in seconds."
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure Payments",
    description: "Integrated PayPal escrow system. Funds are released only when you are 100% satisfied."
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "AI Integration",
    description: "Built-in Gemini AI helps translators work faster with smart suggestions and terminology management."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Verified Experts",
    description: "Every translator undergoes a rigorous verification process and skills assessment."
  },
  {
    icon: <BarChart className="w-6 h-6" />,
    title: "Analytics",
    description: "Detailed reports on project progress, spending, and quality metrics."
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "100+ Languages",
    description: "Global coverage for your business. From Arabic to Zulu, we have you covered."
  }
]

export default function FeaturesPage() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-6 text-center mb-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 font-outfit">Built for the future of work</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Tranzlo combines human expertise with cutting-edge AI to deliver unparalleled translation quality.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col gap-4 p-6 hover:bg-white/[0.02] rounded-2xl transition-all border border-transparent hover:border-white/[0.05]"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold">{feature.title}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
