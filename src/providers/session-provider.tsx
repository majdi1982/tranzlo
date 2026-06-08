"use client";

import * as React from "react";
import type { User, Session } from "@/types";
import { getServices } from "@/services";

interface SessionContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, name: string, role: "translator" | "company") => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function init() {
      try {
        const services = getServices();
        const [currentUser, currentSession] = await Promise.all([
          services.auth.getCurrentUser(),
          services.auth.getSession(),
        ]);
        setUser(currentUser);
        setSession(currentSession);
      } catch {
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const services = getServices();
    const loggedInUser = await services.auth.login({ email, password });
    setUser(loggedInUser);
    const currentSession = await services.auth.getSession();
    setSession(currentSession);
    return loggedInUser;
  }, []);

  const signup = React.useCallback(async (email: string, password: string, name: string, role: "translator" | "company") => {
    const services = getServices();
    const newUser = await services.auth.signup({ email, password, name, role });
    setUser(newUser);
    const currentSession = await services.auth.getSession();
    setSession(currentSession);
    return newUser;
  }, []);

  const logout = React.useCallback(async () => {
    const services = getServices();
    await services.auth.logout();
    setUser(null);
    setSession(null);
  }, []);

  const refreshUser = React.useCallback(async () => {
    try {
      const services = getServices();
      const currentUser = await services.auth.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <SessionContext.Provider value={{ user, session, loading, login, signup, logout, refreshUser }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
