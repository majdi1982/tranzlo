"use client"

import React, { useEffect, useState } from "react"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { 
  getJobWithBids, 
  updateJobStatus,
  incrementJobViews,
  hireTranslator
} from "@/services/jobs/actions"
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  Globe, 
  Users, 
  ChevronLeft, 
  CheckCircle2, 
  Star,
  ShieldCheck,
  MessageSquare,
  ThumbsUp,
  XCircle,
  Layers
} from "lucide-react"
import { Button } from "@/components/atoms/Button"
import Link from "next/link"
import { cn } from "@/lib/utils"

import { ProjectChat } from "@/components/organisms/ProjectChat"
import { useAuth } from "@/hooks/use-auth"

export default function ProjectDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hiringId, setHiringId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await getJobWithBids(id as string)
      setData(res)
      setLoading(false)
      // Increment view counter
      incrementJobViews(id as string)
    }
    fetchData()
  }, [id])

  const handleHire = async (translatorId: string, bidId: string) => {
    if (!confirm("Are you sure you want to hire this translator?")) return
    
    setHiringId(bidId)
    const res = await hireTranslator(id as string, translatorId, bidId)
    if (res.success) {
      alert("Translator hired successfully!")
      window.location.reload()
    } else {
      alert(res.error || "Failed to hire")
    }
    setHiringId(null)
  }

  if (loading) return (
    <DashboardLayout>
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  )

  const { project, bids } = data
  const isInProgress = project.status === "in_progress"

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Back to Projects
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Project Info / Chat */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className={cn(
                  "px-3 py-1 text-xs font-bold rounded-full border",
                  isInProgress ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-primary/10 text-primary border-primary/20"
                )}>
                  {project.status}
                </span>
                <span className="text-muted-foreground text-sm">Posted on {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex flex-col gap-2 mb-6">
                <span className="text-[10px] font-mono text-primary bg-primary/10 w-fit px-2 py-0.5 rounded border border-primary/20">
                  {project.trzId}
                </span>
                <h1 className="text-3xl font-bold">{project.title}</h1>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8 py-6 border-y border-white/5">
                <InfoItem icon={<Globe className="w-4 h-4" />} label="Langs" value={`${project.sourceLanguage} → ${project.targetLanguage}`} />
                <InfoItem icon={<Layers className="w-4 h-4" />} label="Type" value={project.jobType} />
                <InfoItem icon={<DollarSign className="w-4 h-4" />} label="Budget" value={`$${project.budget}`} />
                <InfoItem icon={<Users className="w-4 h-4" />} label="Applications" value={project.applicationCount || 0} />
                <InfoItem icon={<Star className="w-4 h-4" />} label="Views" value={project.viewCount || 0} />
              </div>

              {!isInProgress && (
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-lg font-bold mb-4">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}
            </div>

            {/* Bids or Chat Section */}
            <div className="space-y-6">
              {isInProgress ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">Project Workspace</h2>
                  <ProjectChat projectId={project.$id} currentUserId={user?.$id || ""} />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    Applications <span className="text-sm font-normal text-muted-foreground bg-white/5 px-2 py-1 rounded-lg">{bids.length}</span>
                  </h2>
                  
                  <div className="space-y-4">
                    {bids.length > 0 ? (
                      bids.map((bid: any) => (
                        <motion.div 
                          key={bid.$id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-card p-6 border-white/[0.03] hover:border-primary/20 transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-premium-gradient flex items-center justify-center shrink-0 border border-white/10">
                                <Users className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-lg">{bid.translatorName || "Expert Translator"}</h4>
                                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                                  <span className="flex items-center gap-1 text-amber-500"><Star className="w-3 h-3 fill-amber-500" /> 4.9</span>
                                  <span>•</span>
                                  <span>{bid.completedProjects || 12} Projects done</span>
                                </div>
                                <p className="text-sm text-muted-foreground bg-white/5 p-4 rounded-xl border border-white/5 italic">
                                  &quot;{bid.proposal}&quot;
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-4 min-w-[150px]">
                              <div className="text-right">
                                <div className="text-xl font-bold text-primary">${bid.amount}</div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold">Proposal Price</div>
                              </div>
                              
                              {project.status === "active" && (
                                <Button 
                                  onClick={() => handleHire(bid.translatorId, bid.$id)}
                                  disabled={!!hiringId}
                                  className="w-full gap-2"
                                >
                                  {hiringId === bid.$id ? "Hiring..." : "Hire Now"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                        <p className="text-muted-foreground">Waiting for the first application...</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Actions / Summary */}
          <div className="space-y-6">
            <div className="glass-card p-6 bg-primary/5 border-primary/10">
              <h3 className="font-bold mb-4">Management Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <MessageSquare className="w-4 h-4" /> Message Support
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12 text-red-400 hover:text-red-300">
                  <Briefcase className="w-4 h-4" /> Cancel Project
                </Button>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-bold mb-4">Timeline Info</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-bold text-primary">{project.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bidding Ends</span>
                  <span className="font-bold">In 3 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Completion</span>
                  <span className="font-bold">{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
        {icon} {label}
      </div>
      <div className="font-bold text-sm">{value}</div>
    </div>
  )
}
