"use client"

import React, { useState } from "react"
import Link from "next/link"
import { signup } from "@/services/auth/actions"
import { account } from "@/lib/appwrite/config"
import { OAuthProvider } from "appwrite"
import { Button } from "@/components/atoms/Button"
import { Input } from "@/components/atoms/Input"
import { Globe, User, Briefcase } from "lucide-react"
import { LANGUAGES, COUNTRIES } from "@/lib/constants"

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [role, setRole] = useState<"translator" | "company">("translator")
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" })

  const handleInitialSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setSignupData({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    })
    setStep(2)
  }

  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const finalData = new FormData()
    finalData.append("name", signupData.name)
    finalData.append("email", signupData.email)
    finalData.append("password", signupData.password)
    finalData.append("role", role)
    finalData.append("country", formData.get("country") as string)
    
    // Add dynamic fields
    if (role === "company") {
      finalData.append("companyName", formData.get("companyName") as string)
    } else {
      finalData.append("languages", formData.get("languages") as string)
    }

    const result = await signup(finalData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      window.location.href = "/dashboard"
    }
  }

  const handleOAuth = (provider: OAuthProvider) => {
    account.createOAuth2Session(
      provider,
      `${window.location.origin}/onboarding`, // Redirect to onboarding to pick role
      `${window.location.origin}/signup`
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#02040a]">
      {/* Left side: Hero/Context (Global Feel) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-12 flex-col justify-between border-r border-white/[0.05]">
        <div className="absolute inset-0 bg-premium-gradient opacity-10 blur-[120px] -z-10" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold bg-premium-gradient bg-clip-text text-transparent">
          <Globe className="w-8 h-8 text-primary" /> Tranzlo
        </Link>

        <div className="max-w-xl">
          <h1 className="text-6xl font-bold font-outfit mb-6 leading-tight">
            The World&apos;s <span className="text-primary">Linguistic</span> Gateway.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Join a global network of elite translators and leading companies. 
            Removing language barriers, one project at a time.
          </p>
        </div>

        <div className="flex gap-12">
          <div>
            <p className="text-3xl font-bold font-outfit">100+</p>
            <p className="text-sm text-muted-foreground">Countries</p>
          </div>
          <div>
            <p className="text-3xl font-bold font-outfit">50+</p>
            <p className="text-sm text-muted-foreground">Languages</p>
          </div>
          <div>
            <p className="text-3xl font-bold font-outfit">5k+</p>
            <p className="text-sm text-muted-foreground">Projects Done</p>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(85,34,226,0.05)_0%,transparent_100%)] lg:hidden" />
        
        <div className="max-w-md w-full space-y-8 glass-card p-10 border-white/[0.08] shadow-2xl">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold font-outfit">{step === 1 ? "Create account" : "Complete your profile"}</h2>
            <p className="text-muted-foreground mt-2">
              {step === 1 ? "Start your global journey today." : "Tell us more about yourself"}
            </p>
          </div>

          {step === 1 ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="secondary" className="gap-2 h-12 bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]" onClick={() => handleOAuth(OAuthProvider.Google)}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </Button>
                <Button variant="secondary" className="gap-2 h-12 bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]" onClick={() => handleOAuth(OAuthProvider.Linkedin)}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                  LinkedIn
                </Button>
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/[0.05]"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0b0c14] px-2 text-muted-foreground tracking-widest">Or use email</span></div>
              </div>

              <form onSubmit={handleInitialSignup} className="space-y-4">
                <Input name="name" label="Full Name" placeholder="John Smith" required />
                <Input name="email" label="Email Address" type="email" placeholder="john.smith@global.com" required />
                <Input name="password" label="Password" type="password" placeholder="••••••••" required />
                <Button type="submit" className="w-full h-12 mt-6">Continue</Button>
              </form>
            </>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
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
                <Input name="companyName" label="Company Name" placeholder="Tech Solutions Inc." required />
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Linguistic Expertise</label>
                  <select 
                    name="languages" 
                    className="input-field w-full bg-[#0b0c14] h-12"
                    required
                  >
                    <option value="">Select Primary Language</option>
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
                  className="input-field w-full bg-[#0b0c14] h-12"
                  required
                >
                  <option value="">Select Your Country</option>
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

              <div className="flex gap-4">
                <Button variant="ghost" type="button" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" className="flex-1 h-12" isLoading={loading}>Complete Signup</Button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
