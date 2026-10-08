"use client";

import { useEffect, useState } from "react";
import { useDemoUser } from "@/context/UserContext";
import ResourceCard from "@/components/ResourceCard";
import { CardGridSkeleton } from "@/components/Skeletons";
import type { ResourceWithUploader } from "@/lib/types";

interface BookmarkItem {
  _id: string;
  targetId: string;
  targetType: string;
  resource: ResourceWithUploader | null;
}

export default function BookmarksPage() {
  const { currentUserId, loading: userLoading } = useDemoUser();
  const [items, setItems] = useState<BookmarkItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;
    fetch(`/api/bookmarks?userId=${currentUserId}`)
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

  const resources = (items ?? []).filter((i) => i.resource).map((i) => i.resource!) ;

  return (
    <div className="page-enter mx-auto max-w-5xl px-6 sm:px-8 py-16 sm:py-24">
      <h1 className="text-4xl font-bold mb-12">Bookmarks</h1>

      {userLoading || loading ? (
        <CardGridSkeleton count={3} />
      ) : resources.length === 0 ? (
        <div className="py-16 text-center text-[var(--fg-muted)] italic">
          Nothing bookmarked yet. Save resources you want to find again later.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-8">
          {resources.map((r) => (
            <ResourceCard key={r._id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
}
