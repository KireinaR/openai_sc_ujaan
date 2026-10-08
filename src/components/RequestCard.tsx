import Link from "next/link";
import type { RequestWithDetails } from "@/lib/types";

const URGENCY_STYLE: Record<string, string> = {
  high: "tag-accent",
  medium: "tag",
  low: "tag",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  "in-progress": "In progress",
  resolved: "Resolved",
};

export default function RequestCard({ request }: { request: RequestWithDetails }) {
  return (
    <Link href={`/requests/${request._id}`} className="card card-hover p-7 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-2">
        <div className="font-bold leading-snug line-clamp-2">{request.title}</div>
        <span className={`tag shrink-0 ${URGENCY_STYLE[request.urgency]}`}>
          {request.urgency}
        </span>
      </div>

      <p className="text-sm text-[var(--fg-muted)] line-clamp-2">{request.description}</p>

      <div className="flex flex-wrap gap-2">
        <span className="tag">{request.subject}</span>
        {request.topics.slice(0, 2).map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--border)] text-xs text-[var(--fg-subtle)]">
        <span className="italic">{request.creator ? `by ${request.creator.name}` : "by a student"}</span>
        <span className="flex items-center gap-3">
          <span>{STATUS_LABEL[request.status]}</span>
          <span>
            {request.offers.length} {request.offers.length === 1 ? "response" : "responses"}
          </span>
        </span>
      </div>
    </Link>
  );
}
