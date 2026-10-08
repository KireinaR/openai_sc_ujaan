import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";
import { hydrateRequests } from "@/lib/hydrate";
import RespondPanel from "@/components/RespondPanel";
import type { RequestDoc, RequestWithDetails } from "@/lib/types";

const URGENCY_LABEL: Record<string, string> = { high: "High urgency", medium: "Medium urgency", low: "Low urgency" };

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();

  const db = await getDb();
  const doc = await db.collection("requests").findOne({ _id: new ObjectId(id) });
  if (!doc) notFound();

  const [request] = await hydrateRequests(db, serialize([doc]) as unknown as RequestDoc[]);
  const r = request as RequestWithDetails;

  return (
    <div className="page-enter mx-auto max-w-2xl px-6 sm:px-8 py-16 sm:py-24">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h1 className="text-3xl font-bold leading-snug">{r.title}</h1>
        <span className="tag tag-accent shrink-0">{URGENCY_LABEL[r.urgency]}</span>
      </div>

      <p className="text-sm text-[var(--fg-subtle)] italic mb-10">
        {r.subject} · posted by{" "}
        {r.creator ? (
          <Link href={`/people/${r.creator._id}`} className="text-[var(--accent)] hover:underline">
            {r.creator.name}
          </Link>
        ) : (
          "a student"
        )}
      </p>

      <p className="leading-relaxed text-lg mb-10 pb-10 border-b border-[var(--border)]">
        {r.description}
      </p>

      {(r.topics.length > 0 || r.skills.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-12">
          {r.topics.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
          {r.skills.map((s) => (
            <span key={s} className="tag tag-accent">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mb-12">
        <RespondPanel requestId={r._id} creatorId={r.creatorId} status={r.status} />
      </div>

      {r.offers.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6">
            {r.offers.length} {r.offers.length === 1 ? "response" : "responses"}
          </h2>
          <div className="row-list flex flex-col">
            {r.offers.map((o) => (
              <div key={o._id} className="py-5 first:pt-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">
                    {o.responder ? (
                      <Link href={`/people/${o.responder._id}`} className="hover:underline">
                        {o.responder.name}
                      </Link>
                    ) : (
                      "A student"
                    )}
                  </span>
                  <span className="text-xs text-[var(--fg-subtle)] italic">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-[var(--fg-muted)]">{o.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
