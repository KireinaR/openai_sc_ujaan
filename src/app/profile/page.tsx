"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDemoUser } from "@/context/UserContext";
import ResourceCard from "@/components/ResourceCard";
import RequestCard from "@/components/RequestCard";
import { CardGridSkeleton } from "@/components/Skeletons";
import type { RequestWithDetails, ResourceWithUploader, UserDoc } from "@/lib/types";

interface ProfileData {
  user: UserDoc;
  resources: ResourceWithUploader[];
  requests: RequestWithDetails[];
  bookmarkCount: number;
  unreadNotificationCount: number;
}

export default function ProfilePage() {
  const { currentUserId, loading: userLoading } = useDemoUser();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;
    fetch(`/api/profile?userId=${currentUserId}`)
      .then((res) => res.json())
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  if (userLoading || loading || !data) {
    return (
      <div className="mx-auto max-w-4xl px-6 sm:px-8 py-16 sm:py-24 w-full">
        <div className="skeleton h-9 w-1/3 rounded mb-12" />
        <CardGridSkeleton count={3} />
      </div>
    );
  }

  const { user } = data;

  return (
    <div className="page-enter mx-auto max-w-4xl px-6 sm:px-8 py-16 sm:py-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-[var(--fg-muted)] italic mt-1">
            {user.department} · Year {user.year}
          </p>
        </div>
        <Link href="/settings" className="btn btn-secondary self-start">
          Edit profile
        </Link>
      </div>

      {user.bio && <p className="mb-10 leading-relaxed text-lg">{user.bio}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[var(--border)] mb-16 pb-12 border-b border-[var(--border)]">
        <div className="text-center px-2">
          <div className="text-2xl font-bold">{data.resources.length}</div>
          <div className="text-xs text-[var(--fg-muted)] mt-2 italic">Shared</div>
        </div>
        <div className="text-center px-2">
          <div className="text-2xl font-bold">{data.requests.length}</div>
          <div className="text-xs text-[var(--fg-muted)] mt-2 italic">Requests</div>
        </div>
        <div className="text-center px-2">
          <div className="text-2xl font-bold">{data.bookmarkCount}</div>
          <div className="text-xs text-[var(--fg-muted)] mt-2 italic">Bookmarks</div>
        </div>
        <div className="text-center px-2">
          <div className="text-2xl font-bold">{data.unreadNotificationCount}</div>
          <div className="text-xs text-[var(--fg-muted)] mt-2 italic">Unread</div>
        </div>
      </div>

      {data.resources.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">Your resources</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {data.resources.map((r) => (
              <ResourceCard key={r._id} resource={r} />
            ))}
          </div>
        </section>
      )}

      {data.requests.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6">Your requests</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {data.requests.map((r) => (
              <RequestCard key={r._id} request={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
