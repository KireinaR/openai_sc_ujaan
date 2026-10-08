import Link from "next/link";
import { parseSearchQuery } from "@/lib/ai";
import { runSearch } from "@/lib/search";
import PersonCard from "@/components/PersonCard";
import ResourceCard from "@/components/ResourceCard";
import RequestCard from "@/components/RequestCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <div className="page-enter mx-auto max-w-2xl px-6 sm:px-8 py-32 text-center">
        <h1 className="text-3xl font-bold mb-4">What are you looking for?</h1>
        <p className="text-[var(--fg-muted)] mb-8">
          Try a plain-language search from the home page.
        </p>
        <Link href="/" className="btn btn-primary">
          Back to search
        </Link>
      </div>
    );
  }

  const parsed = await parseSearchQuery(query);
  const results = await runSearch(parsed);

  const chips = [...new Set([...results.parsed.subjects, ...results.parsed.topics, ...results.parsed.skills])];
  const totalResults = results.people.length + results.resources.length + results.requests.length;

  return (
    <div className="page-enter mx-auto max-w-5xl px-6 sm:px-8 py-16 sm:py-24">
      <form action="/search" method="get" className="surface rounded-xl p-2 flex items-center gap-2 mb-10">
        <svg className="ml-2 shrink-0 text-[var(--fg-subtle)]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M20 20l-3.2-3.2" />
        </svg>
        <input
          name="q"
          defaultValue={query}
          className="flex-1 bg-transparent py-2.5 outline-none placeholder:text-[var(--fg-subtle)]"
          placeholder="What are you looking for?"
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      <div className="mb-14 pb-8 border-b border-[var(--border)]">
        <div className="field-label mb-3">Searching for</div>
        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <span key={c} className="tag tag-accent capitalize">
                {c}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[var(--fg-muted)] italic">&ldquo;{query}&rdquo;</p>
        )}
      </div>

      {totalResults === 0 && (
        <div className="py-16 text-center text-[var(--fg-muted)] italic">
          No matches yet. Try different words, or{" "}
          <Link href="/requests" className="text-[var(--accent)] hover:underline not-italic">
            post a request
          </Link>{" "}
          so others can help.
        </div>
      )}

      {results.people.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6">People</h2>
          <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-8">
            {results.people.map((p) => (
              <PersonCard key={p._id} person={p} />
            ))}
          </div>
        </section>
      )}

      {results.resources.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6">Resources</h2>
          <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-8">
            {results.resources.map((r) => (
              <ResourceCard key={r._id} resource={r} />
            ))}
          </div>
        </section>
      )}

      {results.requests.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6">
            {results.requests.length} {results.requests.length === 1 ? "student is" : "students are"}{" "}
            also looking for this
          </h2>
          <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-8">
            {results.requests.map((r) => (
              <RequestCard key={r._id} request={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
