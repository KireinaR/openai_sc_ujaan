import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId || !ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const db = await getDb();
  const bookmarks = await db
    .collection("bookmarks")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  const resourceIds = bookmarks
    .filter((b) => b.targetType === "resource")
    .map((b) => new ObjectId(b.targetId));

  const resources = resourceIds.length
    ? await db.collection("resources").find({ _id: { $in: resourceIds } }).toArray()
    : [];
  const resourceById = new Map(resources.map((r) => [r._id.toHexString(), serialize(r)]));

  const uploaderIds = [...new Set(resources.map((r) => r.uploaderId as string))].map(
    (id) => new ObjectId(id)
  );
  const uploaders = uploaderIds.length
    ? await db
        .collection("users")
        .find({ _id: { $in: uploaderIds } }, { projection: { name: 1, department: 1, year: 1 } })
        .toArray()
    : [];
  const uploaderById = new Map(uploaders.map((u) => [u._id.toHexString(), serialize(u)]));

  const hydrated = bookmarks.map((b) => {
    const resource = resourceById.get(b.targetId);
    return {
      _id: b._id.toHexString(),
      targetType: b.targetType,
      targetId: b.targetId,
      createdAt: (b.createdAt as Date).toISOString(),
      resource: resource
        ? { ...resource, uploader: uploaderById.get(resource.uploaderId) ?? null }
        : null,
    };
  });

  return NextResponse.json(hydrated);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { userId, targetId, targetType } = body ?? {};

  if (!userId || !ObjectId.isValid(userId) || !targetId || !ObjectId.isValid(targetId)) {
    return NextResponse.json({ error: "Valid userId and targetId are required" }, { status: 400 });
  }

  const db = await getDb();
  await db.collection("bookmarks").updateOne(
    { userId, targetId },
    {
      $setOnInsert: {
        userId,
        targetId,
        targetType: targetType || "resource",
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const targetId = searchParams.get("targetId");

  if (!userId || !targetId) {
    return NextResponse.json({ error: "userId and targetId are required" }, { status: 400 });
  }

  const db = await getDb();
  await db.collection("bookmarks").deleteOne({ userId, targetId });

  return NextResponse.json({ ok: true });
}
