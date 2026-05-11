"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Globe, Filter, DollarSign, Clock, CheckCircle } from "lucide-react"
import { getAllOpenProjects, submitBid } from "@/services/projects/actions"
import { Button } from "@/components/atoms/Button"
import { Navbar } from "@/components/organisms/Navbar"

export default function MarketplacePage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [proposal, setProposal] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const res = await getAllOpenProjects()
    if (res.success) setProjects(res.projects)
    setLoading(false)
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) return
    setSubmitting(true)
    
    const res = await submitBid(selectedProject.$id, parseInt(bidAmount), proposal)
    if (res.success) {
      alert("Application submitted successfully!")
      setSelectedProject(null)
      setBidAmount("")
      setProposal("")
    } else {
      alert(res.error || "Failed to submit bid")
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#02040a] text-white font-inter">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold font-outfit mb-2">Marketplace</h1>
            <div className="flex items-center gap-4 text-sm">
                <p className="text-gray-400">Discover and apply for translation projects worldwide.</p>
                <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg font-bold border border-blue-500/20 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    {projects.length} Active Jobs
                </span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                placeholder="Search projects..." 
                className="bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-gray-900/50 rounded-3xl animate-pulse border border-gray-800" />
            ))
          ) : projects.length > 0 ? (
            projects.map((project, index) => (
              <motion.div
                key={project.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 p-8 rounded-3xl hover:border-blue-500/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-500/70 uppercase tracking-tighter">TRZ-PROJ-{project.$id.slice(-6).toUpperCase()}</span>
                      <h3 className="text-xl font-bold">{project.title}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-400">${project.budget}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Budget</div>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{project.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8 border-t border-gray-800 pt-6">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Due {new Date(project.deadline).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> {project.sourceLanguage} to {project.targetLanguage}</span>
                </div>

                <Button 
                  onClick={() => setSelectedProject(project)}
                  className="w-full h-12 rounded-xl text-lg font-bold"
                >
                  Apply Now
                </Button>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-gray-900/20 rounded-3xl border-2 border-dashed border-gray-800">
              <h3 className="text-xl text-gray-500">No open projects found.</h3>
            </div>
          )}
        </div>
      </main>

      {/* Application Drawer / Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-950 border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-2">Apply for Project</h2>
              <p className="text-gray-400 mb-6">{selectedProject.title}</p>
              
              <form onSubmit={handleApply} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Your Proposal Price ($)</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      required
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={selectedProject.budget.toString()}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Cover Letter / Proposal</label>
                  <textarea
                    required
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    rows={6}
                    placeholder="Describe why you are the best fit for this project..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" type="button" className="flex-1 h-12" onClick={() => setSelectedProject(null)}>Cancel</Button>
                  <Button type="submit" disabled={submitting} className="flex-1 h-12 shadow-lg shadow-blue-500/20">
                    {submitting ? "Submitting..." : "Send Proposal"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
