import Link from "next/link";
import type { UserDoc } from "@/lib/types";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PersonCard({ person }: { person: UserDoc }) {
  const helpTopics = person.canHelpWith.slice(0, 3);
  return (
    <Link href={`/people/${person._id}`} className="card card-hover p-7 flex flex-col gap-5">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-full bg-[var(--bg-sunken)] border border-[var(--border)] flex items-center justify-center text-sm font-semibold text-[var(--fg-muted)] shrink-0">
          {initials(person.name)}
        </div>
        <div className="min-w-0">
          <div className="font-bold truncate">{person.name}</div>
          <div className="text-xs text-[var(--fg-subtle)] italic mt-0.5">
            {person.department} · Year {person.year}
          </div>
        </div>
      </div>
      {helpTopics.length > 0 && (
        <div>
          <div className="field-label mb-2.5">Can help with</div>
          <div className="flex flex-wrap gap-2">
            {helpTopics.map((t) => (
              <span key={t} className="tag tag-accent">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
      {person.skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {person.skills.slice(0, 3).map((s) => (
            <span key={s} className="tag">
              {s}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
