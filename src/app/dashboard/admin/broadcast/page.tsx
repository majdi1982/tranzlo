"use client"

import React, { useState } from "react"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { motion } from "framer-motion"
import { 
  Megaphone, 
  Send, 
  Users, 
  Globe, 
  Code, 
  Eye, 
  Type, 
  Bold, 
  Italic, 
  List,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/atoms/Button"
import { sendBroadcast } from "@/services/admin/actions"
import { cn } from "@/lib/utils"

export default function AdminBroadcastPage() {
  const [target, setTarget] = useState<"all" | "translators" | "companies">("all")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ success?: boolean, message?: string } | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return
    
    setLoading(true)
    setStatus(null)
    
    const res = await sendBroadcast(target, title, content)
    
    if (res.success) {
      setStatus({ success: true, message: `Broadcast sent successfully to ${res.count} users!` })
      setTitle("")
      setContent("")
    } else {
      setStatus({ success: false, message: res.error || "Failed to send broadcast." })
    }
    setLoading(false)
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-outfit">Broadcast Center</h1>
            <p className="text-muted-foreground">Communicate with your platform users at scale.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-6">
              <h3 className="font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Target Audience
              </h3>
              
              <div className="space-y-2">
                <TargetOption 
                  active={target === "all"} 
                  onClick={() => setTarget("all")}
                  icon={<Globe className="w-4 h-4" />}
                  label="All Users"
                  description="Everyone on the platform"
                />
                <TargetOption 
                  active={target === "translators"} 
                  onClick={() => setTarget("translators")}
                  icon={<Type className="w-4 h-4" />}
                  label="Translators Only"
                  description="All verified linguists"
                />
                <TargetOption 
                  active={target === "companies"} 
                  onClick={() => setTarget("companies")}
                  icon={<Users className="w-4 h-4" />}
                  label="Companies Only"
                  description="Business accounts"
                />
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl text-sm text-amber-200 flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Broadcasts are irreversible and will be sent instantly to all selected users. Please preview your HTML carefully.</p>
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex gap-2">
                  <Button 
                    variant={!previewMode ? "primary" : "ghost"} 
                    size="sm" 
                    onClick={() => setPreviewMode(false)}
                    className="gap-2"
                  >
                    <Code className="w-4 h-4" /> Editor
                  </Button>
                  <Button 
                    variant={previewMode ? "primary" : "ghost"} 
                    size="sm" 
                    onClick={() => setPreviewMode(true)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" /> Preview
                  </Button>
                </div>
              </div>

              {!previewMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Broadcast Title</label>
                    <input
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. System Update - Version 2.0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-400">Content (Supports HTML)</label>
                      <div className="flex gap-2">
                        <EditorToolbarIcon icon={<Bold />} />
                        <EditorToolbarIcon icon={<Italic />} />
                        <EditorToolbarIcon icon={<List />} />
                      </div>
                    </div>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={12}
                      placeholder="<h1>Hello!</h1> <p>This is a <b>broadcast</b> message...</p>"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              ) : (
                <div className="min-h-[400px] bg-white/5 rounded-3xl p-8 border border-white/10 prose prose-invert max-w-none">
                  <h1 className="text-2xl font-bold mb-4">{title || "No Title"}</h1>
                  <div dangerouslySetInnerHTML={{ __html: content || "<i>No content to preview...</i>" }} />
                </div>
              )}

              {status && (
                <div className={cn(
                  "p-4 rounded-xl text-sm font-medium",
                  status.success ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                )}>
                  {status.message}
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  size="lg" 
                  className="px-10 h-14 font-bold gap-3 shadow-xl shadow-primary/20"
                  onClick={handleSend}
                  disabled={loading || !title || !content}
                >
                  {loading ? "Sending..." : <>Send Broadcast <Send className="w-4 h-4" /></>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function TargetOption({ active, onClick, icon, label, description }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-2xl border text-left transition-all",
        active ? "bg-primary/10 border-primary/30 ring-1 ring-primary/30" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
      )}
    >
      <div className="flex items-center gap-3 mb-1">
        <div className={cn("p-2 rounded-lg", active ? "bg-primary text-white" : "bg-white/5 text-gray-400")}>
          {icon}
        </div>
        <span className={cn("font-bold", active ? "text-primary" : "text-gray-200")}>{label}</span>
      </div>
      <p className="text-xs text-muted-foreground ml-11">{description}</p>
    </button>
  )
}

function EditorToolbarIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
      {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
    </button>
  )
}
