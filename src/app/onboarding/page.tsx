"use client"

import React, { useEffect, useState } from "react"
import { account, APPWRITE_CONFIG } from "@/lib/appwrite/config"
import { createAdminClient } from "@/lib/appwrite/server" // Wait, I need a server action
import { Button } from "@/components/atoms/Button"
import { Input } from "@/components/atoms/Input"
import { Globe, User, Briefcase } from "lucide-react"
import { LANGUAGES, COUNTRIES } from "@/lib/constants"

// I'll define the onboarding action in auth/actions.ts later
import { completeOAuthOnboarding } from "@/services/auth/actions"

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<"translator" | "company">("translator")
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    async function getUser() {
      try {
        const user = await account.get()
        setUserData(user)
      } catch (e) {
        window.location.href = "/signup"
      }
    }
    getUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append("role", role)
    formData.append("userId", userData.$id)
    formData.append("name", userData.name)
    formData.append("email", userData.email)
    formData.append("avatar", userData.prefs?.avatar || "")
    formData.append("country", formData.get("country") as string)

    const result = await completeOAuthOnboarding(formData)
    
    if (result.success) {
      window.location.href = "/dashboard"
    } else {
      alert("Error: " + result.error)
      setLoading(false)
    }
  }

  if (!userData) return <div className="p-10 text-center">Loading your account...</div>

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-8 glass-card p-10">
        <div className="text-center">
          {userData.prefs?.avatar ? (
            <img src={userData.prefs.avatar} alt="Avatar" className="w-20 h-20 rounded-full mx-auto mb-6 border-2 border-primary" />
          ) : (
            <Globe className="w-12 h-12 text-primary mx-auto mb-6" />
          )}
          <h2 className="text-3xl font-bold font-outfit">Welcome, {userData.name}!</h2>
          <p className="text-muted-foreground mt-2">We&apos;ve synced your info from your account. Just one more step to set up your profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => setRole("translator")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'translator' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/[0.02] border-white/[0.05] text-muted-foreground'}`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-wider">Translator</span>
            </button>
            <button 
              type="button"
              onClick={() => setRole("company")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'company' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/[0.02] border-white/[0.05] text-muted-foreground'}`}
            >
              <Briefcase className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-wider">Company</span>
            </button>
          </div>

          {role === "company" ? (
            <Input name="companyName" label="Company Name" placeholder="Your Company" required />
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Main Language</label>
              <select 
                name="languages" 
                className="input-field w-full bg-background"
                required
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Country</label>
            <select 
              name="country" 
              className="input-field w-full bg-background"
              required
            >
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full" isLoading={loading}>
            Start using Tranzlo
          </Button>
        </form>
      </div>
    </div>
  )
}
