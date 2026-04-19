"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { account } from "@/lib/appwrite/client";
import { Models } from "appwrite";

type UserRole = "translator" | "company" | "admin" | null;

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  role: UserRole;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        // In a real app, role would be in preferences or a separate profile collection
        setRole((currentUser.prefs?.role as UserRole) || null);
      } catch (error) {
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, []);

  const logout = async () => {
    await account.deleteSession("current");
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
