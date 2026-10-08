import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";
import { RESOURCE_TYPES } from "@/lib/types";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const {
    title,
    description,
    subject,
    unit,
    topics,
    resourceType,
    tags,
    uploaderId,
    fileUrl,
  } = body;

  if (!title?.trim() || !description?.trim() || !subject?.trim() || !fileUrl?.trim()) {
    return NextResponse.json(
      { error: "title, description, subject and fileUrl are required" },
      { status: 400 }
    );
  }
  if (!uploaderId || !ObjectId.isValid(uploaderId)) {
    return NextResponse.json({ error: "A valid uploaderId is required" }, { status: 400 });
  }
  if (!RESOURCE_TYPES.includes(resourceType)) {
    return NextResponse.json({ error: "Invalid resourceType" }, { status: 400 });
  }

  const db = await getDb();
  const doc = {
    title: title.trim().slice(0, 200),
    description: description.trim().slice(0, 2000),
    subject: subject.trim(),
    unit: unit?.trim() || null,
    topics: toStringArray(topics),
    resourceType,
    tags: toStringArray(tags),
    uploaderId,
    fileUrl: fileUrl.trim(),
    helpfulCount: 0,
    viewCount: 0,
    helpfulBy: [] as string[],
    createdAt: new Date(),
  };

  const result = await db.collection("resources").insertOne(doc);

  return NextResponse.json(serialize({ _id: result.insertedId, ...doc }), { status: 201 });
}
