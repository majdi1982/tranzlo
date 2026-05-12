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
        console.log("useAuth: Fetching user doc for", session.$id);
        const userDoc = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.usersCollectionId,
            session.$id
        )
        console.log("useAuth: DB User found", userDoc.role);
        setUser({ 
            ...session, 
            role: (userDoc as any).role, 
            avatarUrl: (userDoc as any).avatarUrl 
        })
      } catch (dbError: any) {
        console.warn("useAuth: DB Fetch failed, falling back to session", dbError.message);
        setUser(session)
      }
    } catch (error: any) {
      console.error("useAuth: Session check failed", error.message);
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
