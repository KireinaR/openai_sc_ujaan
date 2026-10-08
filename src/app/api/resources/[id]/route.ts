import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid resource id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const { action, userId } = body ?? {};

  if (action !== "helpful") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }
  if (!userId || !ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "A valid userId is required" }, { status: 400 });
  }

  const db = await getDb();
  const resources = db.collection("resources");
  const _id = new ObjectId(id);

  const existing = await resources.findOne({ _id }, { projection: { helpfulBy: 1 } });
  if (!existing) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const alreadyMarked: string[] = existing.helpfulBy ?? [];
  const isMarked = alreadyMarked.includes(userId);

  const result = await resources.findOneAndUpdate(
    { _id },
    isMarked
      ? { $pull: { helpfulBy: userId }, $inc: { helpfulCount: -1 } }
      : { $addToSet: { helpfulBy: userId }, $inc: { helpfulCount: 1 } },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  return NextResponse.json(serialize(result));
}
