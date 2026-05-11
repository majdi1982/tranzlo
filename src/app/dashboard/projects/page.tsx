"use client"

import React, { useEffect, useState } from "react"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { motion } from "framer-motion"
import { Plus, Briefcase, Clock, CheckCircle2, ChevronRight, Users } from "lucide-react"
import { Button } from "@/components/atoms/Button"
import Link from "next/link"
import { getDashboardData } from "@/services/dashboard/actions"

export default function CompanyProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getDashboardData()
      if (data.recentProjects) setProjects(data.recentProjects)
      setLoading(false)
    }
    fetchProjects()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-outfit mb-2">My Projects</h1>
            <p className="text-muted-foreground">Manage your translation requests and active collaborations.</p>
          </div>
          <Link href="/dashboard/projects/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : projects.length > 0 ? (
            projects.map((project, index) => (
              <motion.div
                key={project.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-all group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                      project.status === "Open" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      {project.status}
                    </span>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{project.title}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{project.bidsCount || 0} Applications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span className="font-medium text-foreground">{project.sourceLanguage} → {project.targetLanguage}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <div className="text-lg font-bold">${project.budget}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Fixed Budget</div>
                  </div>
                  <Link href={`/dashboard/projects/${project.$id}`}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      Manage <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
              <Briefcase className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground mb-6">You haven&apos;t posted any projects yet.</p>
              <Link href="/dashboard/projects/create">
                <Button variant="outline">Create Your First Project</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

import { cn } from "@/lib/utils"
