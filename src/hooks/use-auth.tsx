// src/hooks/use-auth.tsx
"use client";

import { account, client, ID } from '@/lib/appwrite';
import { Models } from 'appwrite';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  isAdmin?: boolean; // Example role, can be expanded
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  // const [isAdmin, setIsAdmin] = useState(false); // Could implement role checking later

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Subscribe to account changes (like sessions deleted)
    const unsubscribe = client.subscribe('account', (response) => {
      // If user session was deleted, update the state
      if (response.events.includes('users.sessions.delete')) {
        checkSession();
      }
    });

    checkSession();

    return () => {
      unsubscribe();
    };
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Add login, logout, and signup functions to the hook
  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };
  
  const logout = async () => {
    try {
      await account.deleteSession('current');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };
  
  const signup = async (email: string, password: string, name: string) => {
    try {
      await account.create<Models.Preferences>(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    ...context,
    login,
    logout,
    signup
  };
};
