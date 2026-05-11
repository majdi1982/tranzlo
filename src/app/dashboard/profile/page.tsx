"use client"

import React, { useState, useEffect } from "react"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { motion } from "framer-motion"
import { 
  User, 
  Mail, 
  Building2, 
  Globe, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  Shield, 
  ExternalLink 
} from "lucide-react"
import { Button } from "@/components/atoms/Button"
import { useAuth } from "@/hooks/use-auth"
import { updateProfile } from "@/services/auth/actions"

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    website: "",
    country: "",
    bio: "",
    avatarUrl: ""
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        companyName: (user.prefs as any)?.companyName || "",
        website: (user.prefs as any)?.website || "",
        country: (user.prefs as any)?.country || "Saudi Arabia",
        bio: (user.prefs as any)?.bio || "",
        avatarUrl: (user.prefs as any)?.avatar || ""
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    
    const res = await updateProfile({
      name: formData.name,
      prefs: {
        companyName: formData.companyName,
        website: formData.website,
        country: formData.country,
        bio: formData.bio,
        avatar: formData.avatarUrl
      }
    })

    if (res.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setLoading(false)
  }

  const isCompany = (user?.prefs as any)?.role === "company"

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl font-bold font-outfit mb-2">Public Profile</h1>
          <p className="text-muted-foreground">Manage how other users see you on Tranzlo.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="glass-card p-8 text-center flex flex-col items-center">
              <div className="relative group mb-6">
                <div className="w-32 h-32 rounded-full bg-premium-gradient flex items-center justify-center border-4 border-white/5 overflow-hidden shadow-2xl">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full border-4 border-[#0b0c14] hover:scale-110 transition-all">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-xl font-bold mb-1">{formData.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 uppercase tracking-widest font-bold text-[10px]">
                {isCompany ? "Company Account" : "Translator"}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                  <input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {isCompany && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                    <input 
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Website</label>
                  <input 
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <input 
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">About / Bio</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex justify-end pt-4">
                {success && <span className="text-green-500 text-sm mr-4 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved!</span>}
                <Button type="submit" disabled={loading} className="px-10">
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
