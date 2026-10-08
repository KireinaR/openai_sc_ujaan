import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";
import SearchHero from "@/components/SearchHero";
import ResourceCard from "@/components/ResourceCard";
import PersonCard from "@/components/PersonCard";
import type { ResourceWithUploader, UserDoc } from "@/lib/types";
import { hydrateResources } from "@/lib/hydrate";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = await getDb();

  const [userCount, resourceCount, requestCount, topResourceDocs, activePeopleDocs] =
    await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("resources").countDocuments(),
      db.collection("requests").countDocuments({ status: "open" }),
      db.collection("resources").find({}).sort({ helpfulCount: -1 }).limit(3).toArray(),
      db.collection("users").find({}).sort({ _id: -1 }).limit(3).toArray(),
    ]);

  const topResources = (await hydrateResources(
    db,
    serialize(topResourceDocs) as unknown as ResourceWithUploader[]
  )) as ResourceWithUploader[];
  const activePeople = serialize(activePeopleDocs) as unknown as UserDoc[];

  const stats = [
    { label: "Students", value: userCount },
    { label: "Shared resources", value: resourceCount },
    { label: "Open requests", value: requestCount },
  ];

  return (
    <div className="page-enter">
      <section className="px-6 sm:px-8 pt-24 sm:pt-36 pb-24 sm:pb-36">
        <div className="mx-auto max-w-4xl flex flex-col items-center text-center gap-12">
          <h1 className="text-[2.3rem] leading-[1.15] sm:text-5xl lg:text-6xl sm:leading-[1.1] font-bold tracking-tight text-balance">
            Find the people, knowledge,
            <br className="hidden sm:block" /> and <em>resources</em> you need.
          </h1>
          <p className="text-[var(--fg-muted)] max-w-xl text-balance text-lg">
            One search across every student, note set, and open request on
            campus — ask for what you need in plain language.
          </p>
          <SearchHero />
        </div>
      </section>

      <section className="px-6 sm:px-8 pb-24 sm:pb-32">
        <div className="mx-auto max-w-4xl grid grid-cols-3 divide-x divide-[var(--border)]">
          {stats.map((s) => (
            <div key={s.label} className="text-center px-2">
              <div className="text-3xl sm:text-5xl font-bold tracking-tight">
                {s.value}
              </div>
              <div className="text-xs sm:text-sm text-[var(--fg-muted)] mt-2 italic">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 sm:px-8 pb-24 sm:pb-32">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl font-bold">Most helpful resources</h2>
            <Link href="/resources" className="text-sm text-[var(--accent)] hover:underline">
              Browse all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-8">
            {topResources.map((r) => (
              <ResourceCard key={r._id} resource={r} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-8 pb-32 sm:pb-40">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl font-bold">Newest profiles</h2>
            <Link href="/people" className="text-sm text-[var(--accent)] hover:underline">
              Browse all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-8">
            {activePeople.map((p) => (
              <PersonCard key={p._id} person={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
