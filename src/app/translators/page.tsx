"use client"

import React, { useEffect, useState } from "react"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { getTranslators } from "@/services/profiles/actions"
import { getJobs } from "@/services/jobs/actions"
import { sendInvitation } from "@/services/invitations/actions"
import { UserProfile, Job } from "@/types"
import { Button } from "@/components/atoms/Button"
import { Search, Globe, Star, Mail, UserPlus, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"

export default function TranslatorsPage() {
  const [translators, setTranslators] = useState<UserProfile[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [invitingId, setInvitingId] = useState<string | null>(null)
  const [selectedJobId, setSelectedJobId] = useState("")

  useEffect(() => {
    async function loadData() {
      const [transRes, jobsRes] = await Promise.all([
        getTranslators(),
        getJobs() // In real app, only company's open jobs
      ])
      if (transRes.success) setTranslators(transRes.data || [])
      if (jobsRes.success) setJobs(jobsRes.data?.filter(j => j.status === "published") || [])
      setLoading(false)
    }
    loadData()
  }, [])

  const handleInvite = async (translatorId: string) => {
    if (!selectedJobId) {
      toast.error("Please select a project first")
      return
    }
    const res = await sendInvitation(selectedJobId, translatorId, "I would like to invite you to work on my project.")
    if (res.success) {
      toast.success("Invitation sent successfully!")
      setInvitingId(null)
    } else {
      toast.error(res.error || "Failed to send invitation")
    }
  }

  const filteredTranslators = translators.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.languages?.some(l => l.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold font-outfit">Top Translators</h1>
            <p className="text-muted-foreground">Find and invite expert linguists to your projects.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or language..."
              className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="glass-card h-64 animate-pulse bg-white/5" />
            ))
          ) : filteredTranslators.map((translator) => (
            <motion.div 
              key={translator.$id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 flex flex-col gap-6 group hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-premium-gradient flex items-center justify-center border border-white/10 text-white font-bold text-xl">
                    {translator.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{translator.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      {translator.rating || "5.0"} • {translator.verified ? "Verified" : "Pro"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {translator.languages?.map(lang => (
                  <span key={lang} className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-medium border border-white/10 uppercase">
                    {lang}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Available Now</p>
                  <p>Response time: &lt; 2h</p>
                </div>
                <Button size="sm" variant="primary" className="h-9 px-4" onClick={() => setInvitingId(translator.$id)}>
                  Invite
                </Button>
              </div>

              {/* Invite Overlay */}
              <AnimatePresence>
                {invitingId === translator.$id && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute inset-0 bg-secondary/95 backdrop-blur-xl p-6 rounded-2xl z-10 flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold">Select Project</h4>
                      <button onClick={() => setInvitingId(null)} className="text-muted-foreground hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <select 
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none"
                    >
                      <option value="">Choose a project...</option>
                      {jobs.map(job => (
                        <option key={job.$id} value={job.$id}>{job.title}</option>
                      ))}
                    </select>
                    <Button className="w-full mt-auto" onClick={() => handleInvite(translator.$id)}>
                      Send Invitation
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

function X({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
}
