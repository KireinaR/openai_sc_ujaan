import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";
import BookmarkButton from "@/components/BookmarkButton";
import HelpfulButton from "@/components/HelpfulButton";
import type { ResourceWithUploader } from "@/lib/types";

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();

  const db = await getDb();
  const _id = new ObjectId(id);

  const doc = await db
    .collection("resources")
    .findOneAndUpdate({ _id }, { $inc: { viewCount: 1 } }, { returnDocument: "after" });
  if (!doc) notFound();

  const uploader = await db
    .collection("users")
    .findOne({ _id: new ObjectId(doc.uploaderId) }, { projection: { name: 1, department: 1, year: 1 } });

  const resource = {
    ...(serialize(doc) as unknown as ResourceWithUploader),
    uploader: uploader ? (serialize(uploader) as ResourceWithUploader["uploader"]) : null,
  };

  return (
    <div className="page-enter mx-auto max-w-3xl px-6 sm:px-8 py-16 sm:py-24">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h1 className="text-3xl font-bold leading-snug">{resource.title}</h1>
        <BookmarkButton targetId={resource._id} />
      </div>

      <p className="text-sm text-[var(--fg-subtle)] italic mb-10">
        {resource.subject}
        {resource.unit ? ` · Unit ${resource.unit}` : ""} ·{" "}
        <span className="capitalize">{resource.resourceType}</span>
        {resource.uploader && (
          <>
            {" "}
            · Uploaded by{" "}
            <Link href={`/people/${resource.uploader._id}`} className="hover:underline text-[var(--accent)]">
              {resource.uploader.name}
            </Link>
          </>
        )}
      </p>

      <p className="leading-relaxed text-lg mb-10 pb-10 border-b border-[var(--border)]">
        {resource.description}
      </p>

      {resource.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {resource.topics.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
          {resource.tags.map((t) => (
            <span key={t} className="tag tag-accent">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 flex-wrap">
        <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
          View / Download
        </a>
        <HelpfulButton
          resourceId={resource._id}
          initialCount={resource.helpfulCount}
          initialMarkedBy={resource.helpfulBy}
        />
        <span className="text-sm text-[var(--fg-subtle)]">{resource.viewCount} views</span>
      </div>
    </div>
  );
}
