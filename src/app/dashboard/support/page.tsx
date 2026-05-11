"use client"

import React, { useEffect, useState } from "react"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LifeBuoy, 
  Plus, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  Gavel, 
  MessageSquare,
  Upload,
  FileText,
  Hash
} from "lucide-react"
import { Button } from "@/components/atoms/Button"
import { createTicket, getMyTickets } from "@/services/support/actions"
import { getProjects } from "@/services/projects/actions"
import { cn } from "@/lib/utils"

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [completedProjects, setCompletedProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [modalType, setModalType] = useState<"ticket" | "dispute" | null>(null)
  
  // Form States
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("Medium")
  const [selectedProject, setSelectedProject] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [ticketRes, projectRes] = await Promise.all([
      getMyTickets(),
      getProjects()
    ])
    if (ticketRes.success) setTickets(ticketRes.tickets)
    if (projectRes.success) {
      // Filter for completed but maybe unpaid/disputed projects
      setCompletedProjects(projectRes.projects.filter((p: any) => p.status === "Completed" || p.status === "In Progress"))
    }
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    const res = await createTicket(
      modalType === "dispute" ? `DISPUTE: ${subject}` : subject,
      modalType === "dispute" ? `[Project ID: ${selectedProject}]\n\n${description}` : description,
      modalType === "dispute" ? "High" : priority
    )

    if (res.success) {
      setSubject("")
      setDescription("")
      setSelectedProject("")
      setModalType(null)
      fetchData()
    }
    setSubmitting(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-outfit mb-2">Support & Center</h1>
            <p className="text-muted-foreground">Manage your help tickets and project disputes.</p>
          </div>
          
          <div className="relative">
            <Button 
              className="gap-2" 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <Plus className="w-4 h-4" /> New Request <ChevronDown className="w-4 h-4" />
            </Button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <button 
                    onClick={() => { setModalType("ticket"); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm text-left transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span>Support Ticket</span>
                  </button>
                  <button 
                    onClick={() => { setModalType("dispute"); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm text-left transition-colors border-t border-white/5"
                  >
                    <Gavel className="w-4 h-4 text-red-400" />
                    <span>Dispute System</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
            ))
          ) : tickets.length > 0 ? (
            tickets.map((ticket, index) => (
              <motion.div
                key={ticket.$id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 flex items-center justify-between hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    ticket.subject.startsWith("DISPUTE") ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {ticket.subject.startsWith("DISPUTE") ? <Gavel className="w-6 h-6" /> : <LifeBuoy className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {ticket.subject}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> TRZ-TKT-{ticket.$id.slice(-6).toUpperCase()}</span>
                      <span>•</span>
                      <span className={cn(
                        "font-medium",
                        ticket.priority === 'High' ? 'text-red-400' : 'text-blue-400'
                      )}>{ticket.priority} Priority</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-sm font-bold mb-1 px-2 py-0.5 rounded",
                    ticket.status === 'Open' ? 'text-amber-500 bg-amber-500/10' : 'text-green-500 bg-green-500/10'
                  )}>{ticket.status}</div>
                  <div className="text-xs text-muted-foreground">{new Date(ticket.$createdAt).toLocaleDateString()}</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
              <LifeBuoy className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground">No active requests found.</p>
            </div>
          )}
        </div>

        {/* Modal for Ticket/Dispute */}
        <AnimatePresence>
          {modalType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gray-950 border border-white/10 p-8 rounded-3xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    modalType === "dispute" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {modalType === "dispute" ? <Gavel className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{modalType === "dispute" ? "Open Legal Dispute" : "Support Ticket"}</h2>
                    <p className="text-sm text-muted-foreground">
                      {modalType === "dispute" ? "Submit evidence for an unpaid or failed project." : "Tell us how we can help you."}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  {modalType === "dispute" && (
                    <div className="space-y-4 mb-6 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                      <label className="block text-sm font-medium text-red-400">Select Disputed Project</label>
                      <select 
                        required
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-white"
                      >
                        <option value="">-- Choose Project --</option>
                        {completedProjects.map(p => (
                          <option key={p.$id} value={p.$id}>
                            [{p.$id.slice(-6).toUpperCase()}] {p.title}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold px-1">
                        <AlertCircle className="w-3 h-3" /> Only completed projects are eligible for financial disputes
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                    <input
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={modalType === "dispute" ? "Reason for dispute (e.g. Unpaid balance)" : "Brief summary"}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {modalType === "ticket" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                      <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Detailed Description</label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={modalType === "dispute" ? 6 : 4}
                      placeholder={modalType === "dispute" ? "Explain the situation, missing payments, or quality issues..." : "How can we help?"}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {modalType === "dispute" && (
                    <div className="border-2 border-dashed border-white/5 rounded-2xl p-6 text-center group hover:border-primary/30 transition-all cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary" />
                      <p className="text-sm font-medium">Upload Evidence (Screenshots/Files)</p>
                      <p className="text-xs text-muted-foreground mt-1">Maximum size 10MB</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-6">
                    <Button variant="ghost" className="flex-1" onClick={() => setModalType(null)}>Cancel</Button>
                    <Button 
                      type="submit" 
                      disabled={submitting} 
                      className={cn(
                        "flex-1",
                        modalType === "dispute" ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : ""
                      )}
                    >
                      {submitting ? "Processing..." : modalType === "dispute" ? "Open Dispute" : "Submit Ticket"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
