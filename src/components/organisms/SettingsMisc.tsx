"use client"

import React from "react"
import { Globe, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/atoms/Button"
import { deleteAccount } from "@/services/auth/actions"

export function SettingsSocial() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Link your account to social providers for faster login.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button variant="outline" className="gap-3 h-12 bg-white/5 border-white/10 hover:bg-white/10">
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" /> Bind with Google
        </Button>
        <Button variant="outline" className="gap-3 h-12 bg-white/5 border-white/10 hover:bg-white/10">
          <img src="https://www.linkedin.com/favicon.ico" className="w-4 h-4" alt="LinkedIn" /> Bind with LinkedIn
        </Button>
      </div>
    </div>
  )
}

export function SettingsDangerZone() {
  const handleDelete = async () => {
    if (confirm("Are you absolutely sure? This action is irreversible.")) {
      await deleteAccount()
    }
  }

  return (
    <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-3xl space-y-4">
      <div className="flex items-center gap-3 text-red-500 font-bold">
        <AlertCircle className="w-5 h-5" />
        <h4>Danger Zone</h4>
      </div>
      <p className="text-sm text-red-200/60">Deleting your account will remove all your projects, bids, and personal data. This cannot be undone.</p>
      <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white" onClick={handleDelete}>
        <Trash2 className="w-4 h-4 mr-2" /> Delete My Account
      </Button>
    </div>
  )
}
