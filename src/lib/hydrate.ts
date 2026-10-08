import { Db, ObjectId } from "mongodb";
import { serialize } from "./serialize";
import type {
  OfferDoc,
  OfferWithResponder,
  RequestDoc,
  RequestWithDetails,
  ResourceDoc,
  ResourceWithUploader,
  UserDoc,
} from "./types";

const USER_SUMMARY_PROJECTION = { name: 1, department: 1, year: 1 } as const;

export async function hydrateResources(
  db: Db,
  docs: ResourceDoc[]
): Promise<ResourceWithUploader[]> {
  if (docs.length === 0) return [];
  const uploaderIds = [...new Set(docs.map((d) => d.uploaderId))].map(
    (id) => new ObjectId(id)
  );
  const uploaders = await db
    .collection("users")
    .find({ _id: { $in: uploaderIds } }, { projection: USER_SUMMARY_PROJECTION })
    .toArray();
  const byId = new Map(uploaders.map((u) => [u._id.toHexString(), serialize(u)]));

  return docs.map((doc) => ({
    ...doc,
    uploader: (byId.get(doc.uploaderId) as ResourceWithUploader["uploader"]) ?? null,
  }));
}

export async function hydrateRequests(
  db: Db,
  docs: RequestDoc[]
): Promise<RequestWithDetails[]> {
  if (docs.length === 0) return [];
  const requestIds = docs.map((d) => new ObjectId(d._id));
  const creatorIds = [...new Set(docs.map((d) => d.creatorId))].map(
    (id) => new ObjectId(id)
  );

  const [creators, offerDocs] = await Promise.all([
    db
      .collection("users")
      .find({ _id: { $in: creatorIds } }, { projection: USER_SUMMARY_PROJECTION })
      .toArray(),
    db
      .collection("offers")
      .find({ requestId: { $in: requestIds.map((id) => id.toHexString()) } })
      .sort({ createdAt: -1 })
      .toArray(),
  ]);

  const creatorById = new Map(creators.map((u) => [u._id.toHexString(), serialize(u)]));

  const responderIds = [...new Set(offerDocs.map((o) => o.responderId as string))].map(
    (id) => new ObjectId(id)
  );
  const responders = responderIds.length
    ? await db
        .collection("users")
        .find({ _id: { $in: responderIds } }, { projection: USER_SUMMARY_PROJECTION })
        .toArray()
    : [];
  const responderById = new Map(responders.map((u) => [u._id.toHexString(), serialize(u)]));

  const offersByRequest = new Map<string, OfferWithResponder[]>();
  for (const offer of offerDocs) {
    const serialized = serialize(offer) as unknown as OfferDoc;
    const withResponder: OfferWithResponder = {
      ...serialized,
      responder:
        (responderById.get(serialized.responderId) as OfferWithResponder["responder"]) ??
        null,
    };
    const list = offersByRequest.get(serialized.requestId) ?? [];
    list.push(withResponder);
    offersByRequest.set(serialized.requestId, list);
  }

  return docs.map((doc) => ({
    ...doc,
    creator: (creatorById.get(doc.creatorId) as RequestWithDetails["creator"]) ?? null,
    offers: offersByRequest.get(doc._id) ?? [],
  }));
}

export function toUserDoc(doc: Record<string, unknown>): UserDoc {
  return serialize(doc) as unknown as UserDoc;
}
