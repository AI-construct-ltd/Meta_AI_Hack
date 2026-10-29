"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isFirebaseConfigured } from "./config";
import {
  loginWithGoogle as authLoginGoogle,
  loginWithEmail as authLoginEmail,
  registerWithEmail as authRegisterEmail,
  logoutUser,
  recordUserLogin,
} from "./auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(auth));
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await recordUserLogin(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const u = await authLoginGoogle();
    setUser(u);
    setModalOpen(false);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const u = await authLoginEmail(email, pass);
    setUser(u);
    setModalOpen(false);
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    const u = await authRegisterEmail(email, pass, name);
    setUser(u);
    setModalOpen(false);
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        modalOpen,
        setModalOpen,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
