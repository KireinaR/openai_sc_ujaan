import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";

const EDITABLE_FIELDS = ["bio", "skills", "subjects", "canHelpWith", "learning"] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) {
      if (field === "bio") {
        if (typeof body.bio !== "string") {
          return NextResponse.json({ error: "bio must be a string" }, { status: 400 });
        }
        update.bio = body.bio.slice(0, 1000);
      } else {
        if (!Array.isArray(body[field]) || !body[field].every((v: unknown) => typeof v === "string")) {
          return NextResponse.json({ error: `${field} must be a string array` }, { status: 400 });
        }
        update[field] = (body[field] as string[]).map((v) => v.trim()).filter(Boolean);
      }
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No editable fields supplied" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db
    .collection("users")
    .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: update }, { returnDocument: "after" });

  if (!result) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(serialize(result));
}
