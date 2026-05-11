"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/atoms/Button"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Globe, Bell, User as UserIcon, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { logout } from "@/services/auth/actions"
import { getDashboardData } from "@/services/dashboard/actions"

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user: clientUser, isAuthenticated: clientAuth, loading: clientLoading } = useAuth()
  const [serverUser, setServerUser] = useState<any>(null)
  const [serverLoading, setServerLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getDashboardData()
        if (res.user) setServerUser(res.user)
      } catch (e) {}
      setServerLoading(false)
    }
    fetchUser()
  }, [])

  const user = clientUser || serverUser
  const isAuthenticated = clientAuth || !!serverUser
  const loading = clientLoading && serverLoading

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-premium-gradient bg-clip-text text-transparent">
            <div className="w-8 h-8 rounded-lg bg-premium-gradient flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            Tranzlo
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              Marketplace
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full border border-primary/20">Live</span>
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
          </div>
        </div>

        {!loading && (
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
                </button>
                <Link href="/dashboard" className="flex items-center gap-3 pl-2 border-l border-white/[0.05]">
                  <div className="w-8 h-8 rounded-full bg-premium-gradient flex items-center justify-center border border-white/10 overflow-hidden">
                    {(user?.prefs as any)?.avatar ? (
                      <img src={(user?.prefs as any).avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-white" />
                    )}
                  </div>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-white/[0.05] bg-background overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              <Link href="/marketplace" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Marketplace</Link>
              <Link href="/pricing" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Pricing</Link>
              <Link href="/features" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Features</Link>
              <hr className="border-white/[0.05]" />
              {isAuthenticated ? (
                <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" className="w-full">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="secondary" className="w-full">Log in</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button variant="primary" className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
