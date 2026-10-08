import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";
import { hydrateResources } from "@/lib/hydrate";
import ResourceCard from "@/components/ResourceCard";
import NewResourcePanel from "@/components/NewResourcePanel";
import { RESOURCE_TYPES, type ResourceDoc } from "@/lib/types";

function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; subject?: string; resourceType?: string }>;
}) {
  const { q, subject, resourceType } = await searchParams;
  const db = await getDb();

  const subjects = await db.collection("resources").distinct("subject");

  const filter: Record<string, unknown> = {};
  if (subject) filter.subject = subject;
  if (resourceType) filter.resourceType = resourceType;
  if (q?.trim()) {
    const regex = new RegExp(escapeRegExp(q.trim()), "i");
    filter.$or = [{ title: regex }, { description: regex }, { topics: regex }, { tags: regex }];
  }

  const docs = await db.collection("resources").find(filter).sort({ createdAt: -1 }).toArray();
  const resources = await hydrateResources(db, serialize(docs) as unknown as ResourceDoc[]);

  return (
    <div className="page-enter mx-auto max-w-5xl px-6 sm:px-8 py-16 sm:py-24">
      <h1 className="text-4xl font-bold mb-10">Resources</h1>

      <NewResourcePanel />

      <form
        className="pb-8 mb-12 border-b border-[var(--border)] grid sm:grid-cols-4 gap-4"
        method="get"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search notes, PYQs, slides..."
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
        <select name="resourceType" defaultValue={resourceType ?? ""} className="select">
          <option value="">All types</option>
          {RESOURCE_TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">
              {t}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary sm:col-span-4 sm:w-fit">
          Apply filters
        </button>
      </form>

      {resources.length === 0 ? (
        <div className="py-16 text-center text-[var(--fg-muted)] italic">
          No resources match those filters yet.
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
