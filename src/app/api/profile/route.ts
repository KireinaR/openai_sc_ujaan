import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";
import { hydrateRequests, hydrateResources } from "@/lib/hydrate";
import type { RequestDoc, ResourceDoc } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId || !ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const db = await getDb();

  const [user, resourceDocs, requestDocs, bookmarkCount, unreadCount] = await Promise.all([
    db.collection("users").findOne({ _id: new ObjectId(userId) }),
    db.collection("resources").find({ uploaderId: userId }).sort({ createdAt: -1 }).toArray(),
    db.collection("requests").find({ creatorId: userId }).sort({ createdAt: -1 }).toArray(),
    db.collection("bookmarks").countDocuments({ userId }),
    db.collection("notifications").countDocuments({ userId, read: false }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const resources = serialize(resourceDocs) as unknown as ResourceDoc[];
  const requests = serialize(requestDocs) as unknown as RequestDoc[];

  const [hydratedResources, hydratedRequests] = await Promise.all([
    hydrateResources(db, resources),
    hydrateRequests(db, requests),
  ]);

  return NextResponse.json({
    user: serialize(user),
    resources: hydratedResources,
    requests: hydratedRequests,
    bookmarkCount,
    unreadNotificationCount: unreadCount,
  });
}
