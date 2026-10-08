import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";
import { hydrateRequests, hydrateResources } from "@/lib/hydrate";
import ResourceCard from "@/components/ResourceCard";
import RequestCard from "@/components/RequestCard";
import type { RequestDoc, ResourceDoc, UserDoc } from "@/lib/types";

function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();

  const db = await getDb();
  const userDoc = await db.collection("users").findOne({ _id: new ObjectId(id) });
  if (!userDoc) notFound();

  const [resourceDocs, requestDocs] = await Promise.all([
    db.collection("resources").find({ uploaderId: id }).sort({ createdAt: -1 }).toArray(),
    db.collection("requests").find({ creatorId: id }).sort({ createdAt: -1 }).toArray(),
  ]);

  const person = serialize(userDoc) as unknown as UserDoc;
  const resources = await hydrateResources(db, serialize(resourceDocs) as unknown as ResourceDoc[]);
  const requests = await hydrateRequests(db, serialize(requestDocs) as unknown as RequestDoc[]);

  const tagGroups: { label: string; items: string[] }[] = [
    { label: "Can help with", items: person.canHelpWith },
    { label: "Skills", items: person.skills },
    { label: "Subjects", items: person.subjects },
    { label: "Currently learning", items: person.learning },
  ];

  return (
    <div className="page-enter mx-auto max-w-3xl px-6 sm:px-8 py-16 sm:py-24">
      <div className="flex items-center gap-6 mb-10">
        <div className="h-16 w-16 rounded-full bg-[var(--bg-sunken)] border border-[var(--border)] flex items-center justify-center text-xl font-semibold text-[var(--fg-muted)] shrink-0">
          {initials(person.name)}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{person.name}</h1>
          <p className="text-[var(--fg-muted)] italic mt-1">
            {person.department} · Year {person.year}
          </p>
        </div>
      </div>

      {person.bio && <p className="mb-12 text-[var(--fg)] leading-relaxed">{person.bio}</p>}

      <div className="flex flex-col gap-8 mb-16 pb-12 border-b border-[var(--border)]">
        {tagGroups
          .filter((g) => g.items.length > 0)
          .map((g) => (
            <div key={g.label}>
              <div className="field-label mb-3">{g.label}</div>
              <div className="flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <span key={item} className={`tag ${g.label === "Can help with" ? "tag-accent" : ""}`}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>

      {resources.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">Resources shared</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {resources.map((r) => (
              <ResourceCard key={r._id} resource={r} />
            ))}
          </div>
        </section>
      )}

      {requests.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6">Requests posted</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {requests.map((r) => (
              <RequestCard key={r._id} request={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
