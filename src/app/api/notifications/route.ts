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
  const docs = await db
    .collection("notifications")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json(serialize(docs));
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  const { userId, id, markAll } = body ?? {};

  if (!userId || !ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const db = await getDb();

  if (markAll) {
    await db.collection("notifications").updateMany({ userId, read: false }, { $set: { read: true } });
    return NextResponse.json({ ok: true });
  }

  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db
    .collection("notifications")
    .updateOne({ _id: new ObjectId(id), userId }, { $set: { read: true } });

  return NextResponse.json({ ok: true });
}
