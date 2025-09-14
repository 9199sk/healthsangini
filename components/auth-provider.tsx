"use client";

import type React from "react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  requireAuth: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const isLoading = status === "loading";

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
        avatar: session.user.image || undefined,
        verified: true,
      });
    } else {
      setUser(null);
    }
  }, [session]);

  const login = async () => {
    try {
      const result = await signIn("google", {
        callbackUrl: `${window.location.origin}/dashboard`,
        redirect: false,
      });
      
      if (result?.error) {
        console.error('Sign in error:', result.error);
      } else if (result?.ok && result.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const logout = () => {
    signOut({ callbackUrl: "/" });
  };

  const requireAuth = (action: () => void) => {
    if (!user) {
      router.push("/auth");
    } else {
      action();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, requireAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
