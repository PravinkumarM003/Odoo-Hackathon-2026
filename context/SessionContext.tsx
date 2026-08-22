"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "@/lib/api-client";

export interface SessionUser {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  role: "HR" | "EMPLOYEE";
  department: string;
  designation: string;
  phone?: string | null;
  address?: string | null;
  photoUrl?: string | null;
}

interface SessionContextType {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await authApi.me() as SessionUser;
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.signOut();
    } catch {
      // ignore
    } finally {
      setUser(null);
      window.location.href = "/signin";
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  return (
    <SessionContext.Provider value={{ user, loading, refresh, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
