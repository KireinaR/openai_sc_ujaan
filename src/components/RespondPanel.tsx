"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDemoUser } from "@/context/UserContext";

export default function RespondPanel({
  requestId,
  creatorId,
  status,
}: {
  requestId: string;
  creatorId: string;
  status: string;
}) {
  const { currentUserId } = useDemoUser();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentUserId === creatorId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId || !message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responderId: currentUserId, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not send response");
      }
      setMessage("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(next: string) {
    if (!currentUserId) return;
    await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next, userId: currentUserId }),
    });
    router.refresh();
  }

  if (isOwner) {
    return (
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="field-label mb-1.5">Status</div>
          <div className="capitalize">{status}</div>
        </div>
        <div className="flex gap-2">
          {status !== "in-progress" && (
            <button className="btn btn-secondary" onClick={() => updateStatus("in-progress")}>
              Mark in progress
            </button>
          )}
          {status !== "resolved" && (
            <button className="btn btn-primary" onClick={() => updateStatus("resolved")}>
              Mark resolved
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
      <div className="field-label">Offer to help</div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Let them know how you can help..."
        className="textarea"
        rows={3}
        disabled={!currentUserId}
      />
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <button type="submit" disabled={!currentUserId || submitting} className="btn btn-primary self-start">
        {submitting ? "Sending..." : "Respond"}
      </button>
    </form>
  );
}
