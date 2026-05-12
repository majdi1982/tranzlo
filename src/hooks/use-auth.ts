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
      
      // Fetch role and avatar from DB as truth
      try {
        const userDoc = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.usersCollectionId,
            session.$id
        )
        setUser({ 
            ...session, 
            role: (userDoc as any).role, 
            avatarUrl: (userDoc as any).avatarUrl 
        })
      } catch (e) {
        setUser(session)
      }
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
