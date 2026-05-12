"use client"

import React, { useState, useEffect, useRef } from "react"
import { Send, FileText, User, Paperclip } from "lucide-react"
import { Button } from "@/components/atoms/Button"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  $id: string
  senderId: string
  projectId: string
  text: string
  createdAt: string
  type: "text" | "file"
}

export const ProjectChat = ({ projectId, currentUserId }: { projectId: string, currentUserId: string }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 1. Fetch initial messages
    const fetchMessages = async () => {
      const { getProjectMessages } = await import("@/services/projects/actions");
      const res = await getProjectMessages(projectId);
      if (res.success) setMessages(res.messages);
    };

    fetchMessages();

    // 2. Subscribe to new messages
    const { client } = require("@/lib/appwrite/config");
    const unsubscribe = client.subscribe(
      `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID}.documents`,
      (response: any) => {
        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          const payload = response.payload as Message;
          if (payload.projectId === projectId) {
            setMessages((prev) => [...prev, payload]);
          }
        }
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const { sendMessage } = await import("@/services/projects/actions");
    const res = await sendMessage(projectId, input);
    
    if (res.success) {
      setInput("")
    }
  }

  return (
    <div className="glass-card flex flex-col h-[600px] overflow-hidden border-white/[0.05]">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/[0.05] bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Project Communication</h4>
            <p className="text-[10px] text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        {messages.length > 0 ? (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId
            return (
              <motion.div
                key={msg.$id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] space-y-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm ${
                    isMe 
                      ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20" 
                      : "bg-white/[0.05] text-foreground rounded-tl-none border border-white/[0.05]"
                  }`}>
                    {msg.text}
                  </div>
                  <p className={`text-[10px] text-muted-foreground ${isMe ? "text-right" : "text-left"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <MessageSquare className="w-12 h-12 mb-4" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white/[0.02] border-t border-white/[0.05] flex items-center gap-3">
        <button type="button" className="p-2 hover:bg-white/5 rounded-full text-muted-foreground transition-colors">
          <Paperclip className="w-5 h-5" />
        </button>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <Button type="submit" size="sm" className="rounded-xl h-11 w-11 p-0 flex items-center justify-center shrink-0">
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  )
}

import { MessageSquare } from "lucide-react"
