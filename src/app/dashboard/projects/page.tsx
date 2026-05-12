"use client"

import React, { useEffect, useState } from "react"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { motion } from "framer-motion"
import { Plus, Briefcase, Clock, CheckCircle2, ChevronRight, Users } from "lucide-react"
import { Button } from "@/components/atoms/Button"
import Link from "next/link"
import { getCompanyProjects } from "@/services/jobs/actions"
import { Job } from "@/types"
import { cn } from "@/lib/utils"

export default function CompanyProjectsPage() {
  const [projects, setProjects] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "in_progress" | "completed">("all")

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await getCompanyProjects()
      if (res.success && res.data) setProjects(res.data)
      setLoading(false)
    }
    fetchProjects()
  }, [])

  const filteredProjects = projects.filter(p => {
    if (activeTab === "all") return true
    if (activeTab === "completed") return p.status === "completed"
    return p.status !== "completed"
  })

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold font-outfit mb-2">My Projects</h1>
            <p className="text-muted-foreground">Manage your translation requests and active collaborations.</p>
          </div>
          <Link href="/dashboard/projects/create">
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "all" 
                ? "bg-primary text-white shadow-lg" 
                : "text-muted-foreground hover:text-white"
            )}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("in_progress")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "in_progress" 
                ? "bg-primary text-white shadow-lg" 
                : "text-muted-foreground hover:text-white"
            )}
          >
            In Progress
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "completed" 
                ? "bg-primary text-white shadow-lg" 
                : "text-muted-foreground hover:text-white"
            )}
          >
            Completed
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <motion.div
                key={project.$id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-all group relative overflow-hidden"
              >
                {project.status === "completed" && (
                  <div className="absolute top-0 right-0 p-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 opacity-20" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                      project.status === "completed" 
                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>
                      {project.status === "completed" ? "Completed" : "Processing"}
                    </span>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors leading-tight">{project.title}</h3>
                      <span className="text-[10px] text-muted-foreground/50 font-mono mt-1 uppercase">ID: {project.$id}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{project.status === "completed" ? "Delivered" : "Due"} {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span className="font-medium text-foreground">{project.sourceLanguage} → {project.targetLanguage}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xl font-bold font-outfit text-primary">${project.budget}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Budget</div>
                  </div>
                  <Link href={`/dashboard/projects/${project.$id}`}>
                    <Button variant="ghost" size="sm" className="h-10 px-4 gap-2 bg-white/5 hover:bg-white/10">
                      View <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
              <Briefcase className="w-12 h-12 text-muted-foreground mb-4 opacity-10" />
              <p className="text-muted-foreground mb-6">No {activeTab.replace("_", " ")} projects found.</p>
              {activeTab === "in_progress" && (
                <Link href="/dashboard/projects/create">
                  <Button variant="outline" size="sm">Post New Project</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}


