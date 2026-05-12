"use client"

import { useState, useEffect } from "react"
import { account, databases, APPWRITE_CONFIG } from "@/lib/appwrite/config"
import { Models } from "appwrite"

export const useAuth = () => {
  const [user, setUser] = useState<(Models.User<Models.Preferences> & { role?: string, avatarUrl?: string }) | null>(null)
  const [loading, setLoading] = useState(true)

  const checkSession = async () => {
    try {
      const session = await account.get()
      setUser(session)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return { user, loading, isAuthenticated: !!user, refresh: checkSession }
}
