import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";
import PersonCard from "@/components/PersonCard";
import type { UserDoc } from "@/lib/types";

function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; department?: string; year?: string; skills?: string }>;
}) {
  const { q, department, year, skills } = await searchParams;
  const db = await getDb();

  const [departments, years] = await Promise.all([
    db.collection("users").distinct("department"),
    db.collection("users").distinct("year"),
  ]);

  const filter: Record<string, unknown> = {};
  if (department) filter.department = department;
  if (year) filter.year = Number(year);
  if (skills) {
    const terms = skills.split(",").map((s) => s.trim()).filter(Boolean);
    if (terms.length) filter.skills = { $in: terms.map((t) => new RegExp(escapeRegExp(t), "i")) };
  }
  if (q?.trim()) {
    const regex = new RegExp(escapeRegExp(q.trim()), "i");
    filter.$or = [
      { name: regex },
      { bio: regex },
      { skills: regex },
      { subjects: regex },
      { canHelpWith: regex },
      { learning: regex },
    ];
  }

  const docs = await db.collection("users").find(filter).sort({ name: 1 }).toArray();
  const people = serialize(docs) as unknown as UserDoc[];

  return (
    <div className="page-enter mx-auto max-w-5xl px-6 sm:px-8 py-16 sm:py-24">
      <h1 className="text-4xl font-bold mb-10">People</h1>

      <form
        className="pb-8 mb-12 border-b border-[var(--border)] grid sm:grid-cols-4 gap-4"
        method="get"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, skill, topic..."
          className="input sm:col-span-2"
        />
        <select name="department" defaultValue={department ?? ""} className="select">
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select name="year" defaultValue={year ?? ""} className="select">
          <option value="">All years</option>
          {years
            .sort((a, b) => a - b)
            .map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
        </select>
        <input
          name="skills"
          defaultValue={skills}
          placeholder="Filter by skills (comma separated)"
          className="input sm:col-span-3"
        />
        <button type="submit" className="btn btn-primary sm:col-span-1">
          Apply filters
        </button>
      </form>

      {people.length === 0 ? (
        <div className="py-16 text-center text-[var(--fg-muted)] italic">
          No students match those filters.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-8">
          {people.map((p) => (
            <PersonCard key={p._id} person={p} />
          ))}
        </div>
      )}
    </div>
  );
}
