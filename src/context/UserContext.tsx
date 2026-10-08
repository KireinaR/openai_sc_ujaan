"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface DemoUserSummary {
  _id: string;
  name: string;
  department: string;
  year: number;
}

interface UserContextValue {
  users: DemoUserSummary[];
  currentUserId: string | null;
  currentUser: DemoUserSummary | null;
  setCurrentUserId: (id: string) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

const STORAGE_KEY = "cc_user_id";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<DemoUserSummary[]>([]);
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/users")
      .then((res) => res.json())
      .then((data: DemoUserSummary[]) => {
        if (cancelled) return;
        setUsers(data);
        let stored: string | null = null;
        try {
          stored = localStorage.getItem(STORAGE_KEY);
        } catch {}
        const valid = stored && data.some((u) => u._id === stored);
        const fallback = data[0]?._id ?? null;
        setCurrentUserIdState(valid ? stored : fallback);
        if (!valid && fallback) {
          try {
            localStorage.setItem(STORAGE_KEY, fallback);
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrentUserId = useCallback((id: string) => {
    setCurrentUserIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  }, []);

  const currentUser = useMemo(
    () => users.find((u) => u._id === currentUserId) ?? null,
    [users, currentUserId]
  );

  const value = useMemo(
    () => ({ users, currentUserId, currentUser, setCurrentUserId, loading }),
    [users, currentUserId, currentUser, setCurrentUserId, loading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useDemoUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useDemoUser must be used within UserProvider");
  return ctx;
}
