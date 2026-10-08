"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDemoUser } from "@/context/UserContext";
import type { NotificationDoc } from "@/lib/types";

export default function NotificationsPage() {
  const { currentUserId, loading: userLoading } = useDemoUser();
  const [items, setItems] = useState<NotificationDoc[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;
    fetch(`/api/notifications?userId=${currentUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  async function markAllRead() {
    if (!currentUserId) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId, markAll: true }),
    });
    setItems((prev) => prev?.map((n) => ({ ...n, read: true })) ?? null);
  }

  const showSkeleton = userLoading || loading;

  return (
    <div className="page-enter mx-auto max-w-2xl px-6 sm:px-8 py-16 sm:py-24">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {items && items.some((n) => !n.read) && (
          <button onClick={markAllRead} className="btn btn-ghost text-sm">
            Mark all read
          </button>
        )}
      </div>

      {showSkeleton ? (
        <div className="row-list flex flex-col">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-5 first:pt-0">
              <div className="skeleton h-3.5 w-3/4 rounded mb-2.5" />
              <div className="skeleton h-3 w-1/4 rounded" />
            </div>
          ))}
        </div>
      ) : !items || items.length === 0 ? (
        <div className="py-16 text-center text-[var(--fg-muted)] italic">
          No notifications yet.
        </div>
      ) : (
        <div className="row-list flex flex-col">
          {items.map((n) => (
            <Link
              key={n._id}
              href={n.link}
              className="py-5 first:pt-0 flex items-start justify-between gap-3 transition-colors"
            >
              <div>
                <p className={n.read ? "text-[var(--fg-muted)]" : "text-[var(--fg)]"}>{n.message}</p>
                <p className="text-xs text-[var(--fg-subtle)] italic mt-1.5">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.read && <span className="h-2 w-2 rounded-full bg-[var(--accent)] shrink-0 mt-1.5" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
