// src/hooks/use-auth.ts
"use client";

import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { useContext, useEffect, useState, createContext } from 'react';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin?: boolean; // Example role, can be expanded
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // const [isAdmin, setIsAdmin] = useState(false); // Example: check for admin role

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      // Example: fetch custom claims or user role if needed
      // if (firebaseUser) {
      //   const idTokenResult = await firebaseUser.getIdTokenResult();
      //   setIsAdmin(!!idTokenResult.claims.admin);
      // } else {
      //   setIsAdmin(false);
      // }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
