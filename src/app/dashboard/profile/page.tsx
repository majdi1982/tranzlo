"use client"

import React, { useState, useEffect } from "react"
import DashboardLayout from "@/components/templates/DashboardLayout"
import { motion, AnimatePresence } from "framer-motion"
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
import { getProfile, updateProfileDoc, uploadProfileImage } from "@/services/company/actions"

export default function ProfilePage() {
  const { user, refresh } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [role, setRole] = useState("translator")
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    website: "",
    country: "",
    bio: "",
    avatarUrl: "",
    industry: "",
    taxId: ""
  })

  useEffect(() => {
    const fetchProfile = async () => {
      console.log("Fetching profile...");
      const res = await getProfile()
      console.log("Profile Result:", res);
      if (res.success && res.data) {
        const d = res.data as any
        setRole(res.role || "translator")
        setFormData({
          name: d.contactName || d.name || "",
          companyName: d.companyName || "",
          website: d.website || "",
          country: d.country || "Saudi Arabia",
          bio: d.bio || "",
          avatarUrl: d.logoUrl || d.avatarUrl || "",
          industry: d.industry || "",
          taxId: d.taxId || ""
        })
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    setSuccess(false)
    
    const updateData: any = {
      country: formData.country,
      bio: formData.bio,
    }

    if (role === "company") {
      updateData.contactName = formData.name;
      updateData.companyName = formData.companyName;
      updateData.website = formData.website;
      updateData.industry = formData.industry;
      updateData.taxId = formData.taxId;
    } else {
      updateData.name = formData.name;
    }

    const res = await updateProfileDoc(updateData)

    if (res.success) {
      await refresh()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaveLoading(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSaveLoading(true)
    const fd = new FormData()
    fd.append("image", file)
    
    const res = await uploadProfileImage(fd)
    if (res.success && res.url) {
      setFormData(prev => ({ ...prev, avatarUrl: res.url! }))
      await refresh()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaveLoading(false)
  }

  const isCompany = role === "company"

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold font-outfit mb-2">Public Profile</h1>
          <p className="text-muted-foreground">Manage how other users see you on Tranzlo.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="glass-card p-8 text-center flex flex-col items-center">
              <div className="relative group mb-6">
                <div className="w-32 h-32 rounded-full bg-premium-gradient flex items-center justify-center border-4 border-white/5 overflow-hidden shadow-2xl relative">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                  {saveLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full border-4 border-[#0b0c14] hover:scale-110 transition-all cursor-pointer shadow-xl">
                  <Camera className="w-4 h-4" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={saveLoading}
                  />
                </label>
              </div>
              <h3 className="text-xl font-bold mb-1">{formData.companyName || formData.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 uppercase tracking-widest font-bold text-[10px]">
                {isCompany ? "Company Account" : "Translator"}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                  <input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                {isCompany && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                    <input 
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder="Tranzlo Inc."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Website URL</label>
                  <input 
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <input 
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    placeholder="City, Country"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Industry</label>
                  <input 
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    placeholder="Software, Finance, etc."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tax ID / Registration</label>
                  <input 
                    value={formData.taxId}
                    onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                    placeholder="VAT123456"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">About the Company</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  placeholder="Tell us about your organization..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex justify-end pt-4">
                <AnimatePresence>
                  {success && (
                    <motion.span 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-green-500 text-sm mr-4 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Profile Updated!
                    </motion.span>
                  )}
                </AnimatePresence>
                <Button type="submit" disabled={saveLoading} className="px-10 min-w-[150px]">
                  {saveLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
