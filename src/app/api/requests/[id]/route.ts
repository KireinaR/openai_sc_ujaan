import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";

const STATUSES = new Set(["open", "in-progress", "resolved"]);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const { status, userId } = body ?? {};

  if (!STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (!userId || !ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "A valid userId is required" }, { status: 400 });
  }

  const db = await getDb();
  const _id = new ObjectId(id);

  const existing = await db.collection("requests").findOne({ _id });
  if (!existing) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (existing.creatorId !== userId) {
    return NextResponse.json(
      { error: "Only the request's creator can change its status" },
      { status: 403 }
    );
  }

  const result = await db
    .collection("requests")
    .findOneAndUpdate({ _id }, { $set: { status } }, { returnDocument: "after" });

  return NextResponse.json(serialize(result));
}
