"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDemoUser } from "@/context/UserContext";
import { RESOURCE_TYPES } from "@/lib/types";

export default function NewResourcePanel() {
  const { currentUserId, currentUser } = useDemoUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentUserId) return;
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      subject: form.get("subject"),
      unit: form.get("unit") || null,
      resourceType: form.get("resourceType"),
      fileUrl: form.get("fileUrl"),
      topics: String(form.get("topics") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      tags: String(form.get("tags") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      uploaderId: currentUserId,
    };

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not share resource");
      }
      e.currentTarget.reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-10">
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen((v) => !v)}
        disabled={!currentUserId}
      >
        {open ? "Cancel" : "Share a resource"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="card p-6 mt-5 grid sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2 text-sm text-[var(--fg-muted)]">
            Sharing as <span className="text-[var(--fg)]">{currentUser?.name ?? "..."}</span>
          </div>
          <input name="title" required placeholder="Title (e.g. DBMS Unit 3 Notes)" className="input sm:col-span-2" />
          <textarea name="description" required placeholder="Describe what this covers" className="textarea sm:col-span-2" rows={3} />
          <input name="subject" required placeholder="Subject (e.g. DBMS)" className="input" />
          <input name="unit" placeholder="Unit (optional)" className="input" />
          <select name="resourceType" required defaultValue="" className="select">
            <option value="" disabled>
              Resource type
            </option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>
          <input name="fileUrl" required placeholder="Link to the file (Drive, GitHub, etc.)" className="input" />
          <input name="topics" placeholder="Topics, comma separated" className="input" />
          <input name="tags" placeholder="Tags, comma separated" className="input" />
          {error && <p className="sm:col-span-2 text-sm text-[var(--danger)]">{error}</p>}
          <button type="submit" disabled={submitting} className="btn btn-primary sm:col-span-2">
            {submitting ? "Sharing..." : "Share resource"}
          </button>
        </form>
      )}
    </div>
  );
}
