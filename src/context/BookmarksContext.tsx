"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDemoUser } from "./UserContext";

interface BookmarksContextValue {
  bookmarkedIds: Set<string>;
  isBookmarked: (targetId: string) => boolean;
  toggleBookmark: (targetId: string, targetType?: string) => Promise<void>;
  pending: Set<string>;
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const { currentUserId } = useDemoUser();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;
    fetch(`/api/bookmarks?userId=${currentUserId}`)
      .then((res) => res.json())
      .then((data: { targetId: string }[]) => {
        if (cancelled) return;
        setBookmarkedIds(new Set(data.map((b) => b.targetId)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const toggleBookmark = useCallback(
    async (targetId: string, targetType: string = "resource") => {
      if (!currentUserId) return;
      const alreadyBookmarked = bookmarkedIds.has(targetId);

      setPending((prev) => new Set(prev).add(targetId));
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (alreadyBookmarked) next.delete(targetId);
        else next.add(targetId);
        return next;
      });

      try {
        if (alreadyBookmarked) {
          await fetch(`/api/bookmarks?userId=${currentUserId}&targetId=${targetId}`, {
            method: "DELETE",
          });
        } else {
          await fetch("/api/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUserId, targetId, targetType }),
          });
        }
      } catch {
        // Revert on failure.
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          if (alreadyBookmarked) next.add(targetId);
          else next.delete(targetId);
          return next;
        });
      } finally {
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
      }
    },
    [currentUserId, bookmarkedIds]
  );

  const isBookmarked = useCallback(
    (targetId: string) => bookmarkedIds.has(targetId),
    [bookmarkedIds]
  );

  const value = useMemo(
    () => ({ bookmarkedIds, isBookmarked, toggleBookmark, pending }),
    [bookmarkedIds, isBookmarked, toggleBookmark, pending]
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks(): BookmarksContextValue {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarksProvider");
  return ctx;
}
