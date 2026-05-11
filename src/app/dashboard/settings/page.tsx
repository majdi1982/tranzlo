"use client"

import React, { useState } from "react"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, Lock, Globe, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { SettingsVerification } from "@/components/organisms/SettingsVerification"
import { SettingsSecurity } from "@/components/organisms/SettingsSecurity"
import { SettingsSocial, SettingsDangerZone } from "@/components/organisms/SettingsMisc"

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState("verification")

  const isCompany = (user?.prefs as any)?.role === "company"

  const sections = [
    { id: "verification", label: "Verification", icon: ShieldCheck, show: isCompany },
    { id: "security", label: "Security", icon: Lock, show: true },
    { id: "social", label: "Social Connect", icon: Globe, show: true },
    { id: "danger", label: "Danger Zone", icon: Trash2, show: true },
  ].filter(s => s.show)

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl font-bold font-outfit mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account security, verification and connections.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Nav */}
          <div className="space-y-2">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all",
                  activeSection === s.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="glass-card p-8 min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  {activeSection === "verification" && <SettingsVerification user={user} />}
                  {activeSection === "security" && <SettingsSecurity user={user} />}
                  {activeSection === "social" && <SettingsSocial />}
                  {activeSection === "danger" && <SettingsDangerZone />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
