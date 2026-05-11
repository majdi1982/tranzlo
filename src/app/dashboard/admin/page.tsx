"use client"

import React, { useEffect, useState } from "react"
import { createAdminClient } from "@/lib/appwrite/server"
import { APPWRITE_CONFIG } from "@/lib/appwrite/config"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { Button } from "@/components/atoms/Button"
import { Users, ShieldAlert, Trash2 } from "lucide-react"

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real scenario, this would be a server action
    // For Phase 2, we show the functional requirement
    async function loadUsers() {
      // Mocking the list for admin view demonstration as it requires admin client
      setUsers([
        { $id: "1", name: "John Doe", email: "john@example.com", role: "translator", status: "active" },
        { $id: "2", name: "Global Tech", email: "hr@globaltech.com", role: "company", status: "active" },
      ])
      setLoading(false)
    }
    loadUsers()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Admin Control Panel</h1>
          <p className="text-muted-foreground">Manage users, jobs, and platform integrity.</p>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/[0.03] border-b border-white/[0.05]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {users.map(user => (
                <tr key={user.$id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-sm">{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" className="text-amber-500 hover:bg-amber-500/10">
                      <ShieldAlert className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
