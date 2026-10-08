"use client";

import { useState } from "react";
import { useDemoUser } from "@/context/UserContext";

export default function HelpfulButton({
  resourceId,
  initialCount,
  initialMarkedBy,
}: {
  resourceId: string;
  initialCount: number;
  initialMarkedBy: string[];
}) {
  const { currentUserId } = useDemoUser();
  const [count, setCount] = useState(initialCount);
  const [markedBy, setMarkedBy] = useState<string[]>(initialMarkedBy);
  const [busy, setBusy] = useState(false);

  const active = currentUserId ? markedBy.includes(currentUserId) : false;

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId || busy) return;
    setBusy(true);

    const wasActive = active;
    setCount((c) => (wasActive ? c - 1 : c + 1));
    setMarkedBy((prev) =>
      wasActive ? prev.filter((id) => id !== currentUserId) : [...prev, currentUserId]
    );

    try {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "helpful", userId: currentUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCount(data.helpfulCount);
        setMarkedBy(data.helpfulBy);
      }
    } catch {
      setCount((c) => (wasActive ? c + 1 : c - 1));
      setMarkedBy((prev) =>
        wasActive ? [...prev, currentUserId] : prev.filter((id) => id !== currentUserId)
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!currentUserId || busy}
      aria-pressed={active}
      className={`btn btn-ghost !px-2 !py-1.5 text-sm gap-1.5 disabled:opacity-40 ${
        active ? "!text-[var(--accent)]" : ""
      }`}
      title={active ? "Marked helpful" : "Mark as helpful"}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Zm0 0 4.5-7.5A1.5 1.5 0 0 1 13 3a2 2 0 0 1 2 2v4h4.2a2 2 0 0 1 1.98 2.27l-.9 6A2 2 0 0 1 18.3 19H7" />
      </svg>
      {count}
    </button>
  );
}
