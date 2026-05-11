"use client"

import { useState, useEffect } from "react"
import { account } from "@/lib/appwrite/config"
import { Models } from "appwrite"

export const useAuth = () => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

    checkSession()
  }, [])

  return { user, loading, isAuthenticated: !!user }
}
