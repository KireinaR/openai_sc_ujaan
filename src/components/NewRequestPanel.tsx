"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDemoUser } from "@/context/UserContext";

export default function NewRequestPanel() {
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
      urgency: form.get("urgency"),
      topics: String(form.get("topics") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      skills: String(form.get("skills") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      creatorId: currentUserId,
    };

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not create request");
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
        {open ? "Cancel" : "Post a request"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="card p-6 mt-5 grid sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2 text-sm text-[var(--fg-muted)]">
            Posting as <span className="text-[var(--fg)]">{currentUser?.name ?? "..."}</span>
          </div>
          <input name="title" required placeholder="Title (e.g. Need help with OOP inheritance)" className="input sm:col-span-2" />
          <textarea name="description" required placeholder="Describe what you need" className="textarea sm:col-span-2" rows={3} />
          <input name="subject" required placeholder="Subject (e.g. OOP)" className="input" />
          <select name="urgency" defaultValue="medium" className="select">
            <option value="low">Low urgency</option>
            <option value="medium">Medium urgency</option>
            <option value="high">High urgency</option>
          </select>
          <input name="topics" placeholder="Topics, comma separated" className="input" />
          <input name="skills" placeholder="Skills needed, comma separated" className="input" />
          {error && <p className="sm:col-span-2 text-sm text-[var(--danger)]">{error}</p>}
          <button type="submit" disabled={submitting} className="btn btn-primary sm:col-span-2">
            {submitting ? "Posting..." : "Post request"}
          </button>
        </form>
      )}
    </div>
  );
}
