"use client"

import React, { useEffect, useState } from "react"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Clock, CheckCircle2, MessageSquare, Briefcase, Plus, Search } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getDashboardData } from "@/services/dashboard/actions"
import { Button } from "@/components/atoms/Button"
import Link from "next/link"
import { ProjectChat } from "@/components/organisms/ProjectChat"

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      const res = await getDashboardData()
      setData(res)
      setLoading(false)
    }
    fetchDashboard()
  }, [])

  const firstName = user?.name?.split(" ")[0] || "there"
  const isCompany = (user?.prefs as any)?.role === "company"

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (data?.error) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-10">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl mb-4 border border-red-500/20">
            Error: {data.error}
          </div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-bold font-outfit mb-2">Welcome back, {firstName}!</h1>
            <p className="text-muted-foreground">Here&apos;s a quick look at your {isCompany ? "business" : "translation"} status.</p>
          </motion.div>
          
          <div className="flex gap-4">
            {isCompany ? (
              <Link href="/dashboard/projects/create">
                <Button className="gap-2 shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" /> Post a Project
                </Button>
              </Link>
            ) : (
              <Link href="/marketplace">
                <Button className="gap-2 shadow-lg shadow-primary/20">
                  <Search className="w-4 h-4" /> Browse Jobs
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<TrendingUp className="text-green-500" />} 
            label={isCompany ? "Total Budget" : "Earnings"} 
            value={isCompany ? `$${data?.stats?.totalBudget || 0}` : `$${data?.stats?.earnings || 0}`} 
            subValue="+12% from last month" 
            index={0}
          />
          <StatCard 
            icon={<Clock className="text-blue-500" />} 
            label="In Progress" 
            value={data?.stats?.activeProjects || 0} 
            subValue="Projects being worked on" 
            index={1}
          />
          <StatCard 
            icon={<CheckCircle2 className="text-purple-500" />} 
            label="Completed" 
            value={data?.stats?.completedProjects || 0} 
            subValue="Successfully delivered" 
            index={2}
          />
          <StatCard 
            icon={<MessageSquare className="text-amber-500" />} 
            label="Applications" 
            value={isCompany ? data?.stats?.totalApplications || 0 : data?.bids?.length || 0} 
            subValue="Latest interactions" 
            index={3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-8">
             {/* Active Workspace / Chat for Companies with active projects */}
             {isCompany && data.stats.activeProjects > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Active Collaboration</h2>
                  <ProjectChat projectId="active" currentUserId={user?.$id || ""} />
                </div>
             )}

            {/* Recent Projects List */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Recent {isCompany ? "Postings" : "Assignments"}</h2>
                <Link href="/dashboard/projects" className="text-sm text-primary font-medium hover:underline">
                  View all
                </Link>
              </div>
              
              <div className="space-y-4">
                {data.recentProjects && data.recentProjects.length > 0 ? (
                  data.recentProjects.map((project: any) => (
                    <ProjectItem 
                      key={project.$id}
                      title={project.title} 
                      status={project.status} 
                      budget={project.budget}
                      createdAt={project.$createdAt}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">No projects found yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick Info Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="glass-card p-8 bg-premium-gradient text-white border-none shadow-xl shadow-primary/20 overflow-hidden relative group">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-xl font-bold mb-4">Level up your game</h3>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                {isCompany 
                  ? "Switch to **Business Pro** to manage teams and access premium linguists."
                  : "Upgrade to **Translator Plus** to unlock AI translation memory and verified badges."
                }
              </p>
              <button className="w-full bg-white text-primary font-bold py-3 rounded-xl hover:shadow-lg transition-all active:scale-95">
                Learn More
              </button>
            </div>

            <div className="glass-card p-6">
              <h4 className="font-bold mb-4">Latest Notifications</h4>
              <div className="space-y-4">
                <div className="flex gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 bg-primary rounded-full shrink-0" />
                  <p className="text-muted-foreground">New application received for &quot;Mobile App Localization&quot;</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 bg-white/10 rounded-full shrink-0" />
                  <p className="text-muted-foreground">Project &quot;Legal Contract&quot; marked as completed.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ icon, label, value, subValue, index }: { icon: React.ReactNode, label: string, value: any, subValue: string, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="glass-card p-6 hover:border-primary/30 transition-all hover:translate-y-[-4px]"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="p-2 bg-white/[0.03] rounded-lg border border-white/[0.05]">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{subValue}</div>
    </motion.div>
  )
}

function ProjectItem({ title, status, budget, createdAt }: { title: string, status: string, budget: number, createdAt: string }) {
  return (
    <div className="p-4 rounded-xl hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/[0.05] group flex items-center justify-between">
      <div>
        <h4 className="font-medium group-hover:text-primary transition-colors mb-1">{title}</h4>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(createdAt).toLocaleDateString()}</span>
          <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10">{status}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-sm text-foreground">${budget}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Fixed</div>
      </div>
    </div>
  )
}
