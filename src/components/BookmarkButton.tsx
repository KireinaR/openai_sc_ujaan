"use client";

import { useBookmarks } from "@/context/BookmarksContext";
import { useDemoUser } from "@/context/UserContext";

export default function BookmarkButton({
  targetId,
  targetType = "resource",
  size = "md",
}: {
  targetId: string;
  targetType?: string;
  size?: "sm" | "md";
}) {
  const { isBookmarked, toggleBookmark, pending } = useBookmarks();
  const { currentUserId } = useDemoUser();
  const active = isBookmarked(targetId);
  const isPending = pending.has(targetId);
  const dim = size === "sm" ? 16 : 18;

  return (
    <button
      type="button"
      disabled={!currentUserId || isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(targetId, targetType);
      }}
      aria-pressed={active}
      aria-label={active ? "Remove bookmark" : "Add bookmark"}
      title={active ? "Remove bookmark" : "Bookmark"}
      className={`btn btn-ghost !px-2 !py-1.5 disabled:opacity-40 ${
        active ? "!text-[var(--accent)]" : ""
      }`}
    >
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path strokeLinejoin="round" d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.2L5 21V4.5a1 1 0 0 1 1-1Z" />
      </svg>
    </button>
  );
}
