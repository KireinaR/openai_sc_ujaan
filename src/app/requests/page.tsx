import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";
import { hydrateRequests } from "@/lib/hydrate";
import RequestCard from "@/components/RequestCard";
import NewRequestPanel from "@/components/NewRequestPanel";
import type { RequestDoc } from "@/lib/types";

function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; subject?: string; status?: string }>;
}) {
  const { q, subject, status } = await searchParams;
  const db = await getDb();

  const subjects = await db.collection("requests").distinct("subject");

  const filter: Record<string, unknown> = {};
  filter.status = status || { $ne: "resolved" };
  if (subject) filter.subject = subject;
  if (q?.trim()) {
    const regex = new RegExp(escapeRegExp(q.trim()), "i");
    filter.$or = [{ title: regex }, { description: regex }, { topics: regex }, { skills: regex }];
  }

  const docs = await db.collection("requests").find(filter).sort({ createdAt: -1 }).toArray();
  const requests = await hydrateRequests(db, serialize(docs) as unknown as RequestDoc[]);

  return (
    <div className="page-enter mx-auto max-w-5xl px-6 sm:px-8 py-16 sm:py-24">
      <h1 className="text-4xl font-bold mb-10">Requests</h1>

      <NewRequestPanel />

      <form
        className="pb-8 mb-12 border-b border-[var(--border)] grid sm:grid-cols-4 gap-4"
        method="get"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search requests..."
          className="input sm:col-span-2"
        />
        <select name="subject" defaultValue={subject ?? ""} className="select">
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="select">
          <option value="">Open &amp; in progress</option>
          <option value="open">Open</option>
          <option value="in-progress">In progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <button type="submit" className="btn btn-primary sm:col-span-4 sm:w-fit">
          Apply filters
        </button>
      </form>

      {requests.length === 0 ? (
        <div className="py-16 text-center text-[var(--fg-muted)] italic">
          No requests match those filters yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-8">
          {requests.map((r) => (
            <RequestCard key={r._id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}
