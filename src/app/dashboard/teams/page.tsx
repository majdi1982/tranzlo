"use client"

import React, { useEffect, useState } from "react"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { motion } from "framer-motion"
import { Users, Plus, Shield, UserPlus, Mail } from "lucide-react"
import { Button } from "@/components/atoms/Button"
import { getMyTeams, createTeam } from "@/services/teams/actions"

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    const res = await getMyTeams()
    if (res.success) setTeams(res.teams)
    setLoading(false)
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName) return
    
    const res = await createTeam(newTeamName)
    if (res.success) {
      setNewTeamName("")
      setShowCreateModal(false)
      fetchTeams()
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-outfit mb-2">Teams</h1>
            <p className="text-muted-foreground">Collaborate with other professionals or manage your agency.</p>
          </div>
          <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" /> Create Team
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
            ))
          ) : teams.length > 0 ? (
            teams.map((team, index) => (
              <motion.div
                key={team.$id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 border-white/5 hover:border-primary/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg">{team.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                    {team.description || "No description provided."}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-background flex items-center justify-center text-[10px] font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">
                    Manage <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
              <Users className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground">You are not part of any team yet.</p>
            </div>
          )}
        </div>

        {/* Create Team Modal Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">Create New Team</h2>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Team Name</label>
                  <input
                    autoFocus
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. Arabic Experts"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1">Create</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
