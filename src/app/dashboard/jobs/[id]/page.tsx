"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { getJobById, updateJobStatus } from "@/services/jobs/actions"
import { getChatRoom, sendMessage, getMessages } from "@/services/chat/actions"
import { getJobFiles, uploadFileMetadata } from "@/services/files/actions"
import { openDispute } from "@/services/disputes/actions"
import { Job, Message, FileMetadata, ChatRoom } from "@/types"
import { Button } from "@/components/atoms/Button"
import { Input } from "@/components/atoms/Input"
import { MessageSquare, FileText, AlertCircle, Send, Download } from "lucide-react"

export default function JobWorkspacePage() {
  const { id } = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    async function loadWorkspace() {
      const jobRes = await getJobById(id as string)
      const roomRes = await getChatRoom(id as string)
      const filesRes = await getJobFiles(id as string)
      
      if (jobRes.success) setJob(jobRes.data || null)
      if (roomRes.success && roomRes.data) {
        setRoom(roomRes.data)
        const msgRes = await getMessages(roomRes.data.$id)
        if (msgRes.success) setMessages(msgRes.data || [])
      }
      if (filesRes.success) setFiles(filesRes.data || [])
      
      setLoading(false)
    }
    loadWorkspace()
  }, [id])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !room) return
    
    const res = await sendMessage(room.$id, newMessage)
    if (res.success) {
      setMessages([...messages, res.data as unknown as Message])
      setNewMessage("")
    }
  }

  if (loading) return <div className="p-10 text-center">Loading workspace...</div>
  if (!job) return <div className="p-10 text-center">Project not found.</div>

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-12rem)] flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-outfit">{job.title}</h1>
            <p className="text-sm text-muted-foreground">Collaborating with {job.sourceLanguage} → {job.targetLanguage}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openDispute(job.$id, "Project issue")}>
              <AlertCircle className="w-4 h-4 mr-2" /> Dispute
            </Button>
            {job.status === "in_progress" && (
              <Button variant="primary" size="sm" onClick={() => updateJobStatus(job.$id, "completed")}>
                Complete Project
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Chat Panel */}
          <div className="lg:col-span-2 glass-card flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/[0.05] bg-white/[0.02]">
              <h2 className="font-bold flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Live Chat</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.$id} className={`flex ${msg.type === 'system' ? 'justify-center' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.type === 'system' ? 'bg-white/5 text-muted-foreground italic' : 'bg-white/[0.03] border border-white/[0.05]'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/[0.05] flex gap-2">
              <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="sm"><Send className="w-4 h-4" /></Button>
            </form>
          </div>

          {/* Files Panel */}
          <div className="glass-card flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/[0.05] bg-white/[0.02]">
              <h2 className="font-bold flex items-center gap-2"><FileText className="w-4 h-4" /> Files</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {files.map(file => (
                <div key={file.$id} className="p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{file.fileName}</p>
                    <p className="text-[10px] text-muted-foreground">v{file.version} • {new Date(file.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-primary">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/[0.05]">
              <Button variant="secondary" className="w-full text-xs" onClick={() => uploadFileMetadata(job.$id, "mock-id", "translation_v1.docx")}>
                Upload Deliverable
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
