"use client"

import React, { useState } from "react"
import { Lock, Mail, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/atoms/Button"
import { updateEmail, updatePassword } from "@/services/auth/actions"

export function SettingsSecurity({ user }: { user: any }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [email, setEmail] = useState(user?.email || "")
  const [newPassword, setNewPassword] = useState("")

  const handleUpdateEmail = async () => {
    setLoading(true)
    const res = await updateEmail(email)
    if (res.success) setSuccess("Email update request sent!")
    setLoading(false)
  }

  const handleUpdatePassword = async () => {
    setLoading(true)
    const res = await updatePassword(newPassword)
    if (res.success) {
      setSuccess("Password updated!")
      setNewPassword("")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-bold flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Email Address</h3>
        <div className="flex gap-4">
          <input 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
          />
          <Button onClick={handleUpdateEmail} disabled={loading}>Update</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> Change Password</h3>
        <div className="flex gap-4">
          <input 
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
          />
          <Button onClick={handleUpdatePassword} disabled={loading || !newPassword}>Update</Button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {success}
        </div>
      )}
    </div>
  )
}
