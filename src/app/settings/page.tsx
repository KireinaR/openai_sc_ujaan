"use client";

import { useEffect, useState } from "react";
import { useDemoUser } from "@/context/UserContext";
import ThemeToggle from "@/components/ThemeToggle";
import type { UserDoc } from "@/lib/types";

function arrayToText(arr: string[]): string {
  return arr.join(", ");
}

export default function SettingsPage() {
  const { currentUserId, loading: userLoading } = useDemoUser();
  const [user, setUser] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ bio: "", skills: "", subjects: "", canHelpWith: "", learning: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;
    fetch(`/api/profile?userId=${currentUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setUser(data.user);
        setForm({
          bio: data.user.bio ?? "",
          skills: arrayToText(data.user.skills ?? []),
          subjects: arrayToText(data.user.subjects ?? []),
          canHelpWith: arrayToText(data.user.canHelpWith ?? []),
          learning: arrayToText(data.user.learning ?? []),
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) return;
    setSaving(true);
    setSaved(false);
    const toList = (s: string) => s.split(",").map((v) => v.trim()).filter(Boolean);

    await fetch(`/api/users/${currentUserId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: form.bio,
        skills: toList(form.skills),
        subjects: toList(form.subjects),
        canHelpWith: toList(form.canHelpWith),
        learning: toList(form.learning),
      }),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="page-enter mx-auto max-w-2xl px-6 sm:px-8 py-16 sm:py-24">
      <h1 className="text-4xl font-bold mb-12">Settings</h1>

      <div className="flex items-center justify-between mb-12 pb-10 border-b border-[var(--border)]">
        <div>
          <div className="font-bold">Appearance</div>
          <div className="text-sm text-[var(--fg-muted)] italic mt-1">Switch between light and dark.</div>
        </div>
        <ThemeToggle />
      </div>

      <div>
        <div className="font-bold mb-2 text-lg">Your profile</div>
        <p className="text-sm text-[var(--fg-muted)] mb-8">
          Editing as <strong className="text-[var(--fg)]">{user?.name ?? "..."}</strong>{" "}
          <span className="italic">
            (demo identity, switch who you&rsquo;re browsing as from the navbar).
          </span>
        </p>

        {userLoading || loading ? (
          <div className="flex flex-col gap-4">
            <div className="skeleton h-20 w-full rounded" />
            <div className="skeleton h-10 w-full rounded" />
            <div className="skeleton h-10 w-full rounded" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="field-label block mb-1.5">Bio</label>
              <textarea
                className="textarea"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>
            <div>
              <label className="field-label block mb-1.5">Skills (comma separated)</label>
              <input
                className="input"
                value={form.skills}
                onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
              />
            </div>
            <div>
              <label className="field-label block mb-1.5">Subjects (comma separated)</label>
              <input
                className="input"
                value={form.subjects}
                onChange={(e) => setForm((f) => ({ ...f, subjects: e.target.value }))}
              />
            </div>
            <div>
              <label className="field-label block mb-1.5">Can help with (comma separated)</label>
              <input
                className="input"
                value={form.canHelpWith}
                onChange={(e) => setForm((f) => ({ ...f, canHelpWith: e.target.value }))}
              />
            </div>
            <div>
              <label className="field-label block mb-1.5">Currently learning (comma separated)</label>
              <input
                className="input"
                value={form.learning}
                onChange={(e) => setForm((f) => ({ ...f, learning: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="btn btn-primary self-start">
                {saving ? "Saving..." : "Save changes"}
              </button>
              {saved && <span className="text-sm text-[var(--success)]">Saved.</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
