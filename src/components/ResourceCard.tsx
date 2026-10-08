import Link from "next/link";
import type { ResourceWithUploader } from "@/lib/types";
import BookmarkButton from "./BookmarkButton";
import HelpfulButton from "./HelpfulButton";

export default function ResourceCard({ resource }: { resource: ResourceWithUploader }) {
  return (
    <Link
      href={`/resources/${resource._id}`}
      className="card card-hover p-7 flex flex-col gap-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-bold leading-snug line-clamp-2">{resource.title}</div>
          <div className="text-xs text-[var(--fg-subtle)] mt-1.5 italic">
            {resource.subject}
            {resource.unit ? ` · Unit ${resource.unit}` : ""} ·{" "}
            <span className="capitalize">{resource.resourceType}</span>
          </div>
        </div>
        <BookmarkButton targetId={resource._id} />
      </div>

      <p className="text-sm text-[var(--fg-muted)] line-clamp-2">{resource.description}</p>

      {resource.topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {resource.topics.slice(0, 3).map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--border)] text-xs text-[var(--fg-subtle)]">
        <span className="italic">{resource.uploader ? `Uploaded by ${resource.uploader.name}` : "Uploaded by a student"}</span>
        <HelpfulButton
          resourceId={resource._id}
          initialCount={resource.helpfulCount}
          initialMarkedBy={resource.helpfulBy}
        />
      </div>
    </Link>
  );
}
