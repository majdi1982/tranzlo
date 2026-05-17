import React, { createContext, useContext, useEffect, useState } from 'react';
import { account, databases, APPWRITE_CONFIG } from '../lib/appwrite';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const session = await account.get();
      if (session) {
        // Fetch preferences (Where the role is stored according to the screenshot)
        const prefs = await account.getPrefs();
        
        // Try to fetch detailed profile from database if needed
        let profile = null;
        try {
          const collectionId = prefs.role === 'translator' 
            ? APPWRITE_CONFIG.collections.translators 
            : APPWRITE_CONFIG.collections.companies;

          profile = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            collectionId,
            session.$id
          );
        } catch (e) {
          profile = null;
        }
        
        setUser({ ...session, profile, role: prefs.role });
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    await account.createEmailPasswordSession(email, pass);
    await refreshUser();
  };

  const register = async (email: string, pass: string, name: string) => {
    await account.create('unique()', email, pass, name);
    await login(email, pass);
  };

  const logout = async () => {
    await account.deleteSession('current');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
