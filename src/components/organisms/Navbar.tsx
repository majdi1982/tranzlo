"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/atoms/Button"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Globe, User as UserIcon, LogOut, Building2, Settings, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { logout } from "@/services/auth/actions"
import { NotificationCenter } from "@/components/organisms/NotificationCenter"

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, isAuthenticated, loading } = useAuth()
  const profileRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  useEffect(() => {
    console.log("Navbar State:", { isAuthenticated, loading, userId: user?.$id });
  }, [isAuthenticated, loading, user]);

  const navLinks = [
    { name: "Marketplace", path: "/marketplace", live: true },
    { name: "Translators", path: "/translators", role: "company" },
    { name: "Pricing", path: "/pricing" },
    { name: "About", path: "/about" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
      <div className="w-full max-w-7xl">
        <div className="glass-card flex items-center justify-between px-6 py-3 border-white/[0.08] bg-secondary/80 backdrop-blur-xl shadow-2xl relative">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-premium-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300">
              <Globe className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-outfit tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Tranzlo
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              if (link.role && user?.role !== link.role) return null;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors relative group"
                >
                  {link.name}
                  {link.live && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full border border-primary/20">Live</span>
                  )}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center gap-4">
                    <NotificationCenter user={user} />
                    
                    <div className="relative" ref={profileRef}>
                      <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-3 border-l border-white/[0.1] focus:outline-none group"
                      >
                        <div className="w-9 h-9 rounded-full bg-premium-gradient p-[1px] shadow-lg group-hover:ring-2 ring-primary/30 transition-all">
                          <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                            {user?.avatarUrl || (user?.prefs as any)?.avatar ? (
                              <img src={user?.avatarUrl || (user?.prefs as any).avatar} alt={user?.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon className="w-4 h-4 text-white/70" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {isProfileOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-4 w-64 z-50"
                          >
                            <div className="glass-card p-2 bg-secondary/95 backdrop-blur-2xl border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                              <div className="px-4 py-3 border-b border-white/[0.05] mb-2">
                                <p className="text-sm font-bold truncate text-white">{(user?.prefs as any)?.companyName || user?.name}</p>
                                <p className="text-[10px] text-primary uppercase tracking-widest font-bold mt-0.5">
                                  {user?.role === "company" ? "Company Account" : "Translator"}
                                </p>
                              </div>
                              
                              <div className="space-y-1">
                                <Link 
                                    href="/dashboard" 
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
                                >
                                  <LayoutDashboard className="w-4 h-4" />
                                  Dashboard
                                </Link>
                                
                                <Link 
                                    href="/dashboard/profile" 
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
                                >
                                  <UserIcon className="w-4 h-4" />
                                  Public Profile
                                </Link>

                                <Link 
                                    href="/dashboard/settings" 
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
                                >
                                  <Settings className="w-4 h-4" />
                                  Settings
                                </Link>
                              </div>

                              <div className="mt-2 pt-2 border-t border-white/[0.05]">
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                >
                                  <LogOut className="w-4 h-4" />
                                  Logout
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="text-white/70">Log in</Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="primary" size="sm" className="shadow-lg shadow-primary/20">Get Started</Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Toggle */}
            <button 
              className="lg:hidden text-white/70 hover:text-white transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden mt-2"
            >
              <div className="glass-card p-6 bg-secondary/95 backdrop-blur-2xl border-white/[0.1] shadow-2xl flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name}
                    href={link.path} 
                    className="text-lg font-medium text-white/70 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <hr className="border-white/[0.05]" />
                {isAuthenticated ? (
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button variant="primary" className="w-full">Dashboard</Button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="secondary" className="w-full">Log in</Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      <Button variant="primary" className="w-full">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
