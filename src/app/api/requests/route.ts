import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

const URGENCIES = new Set(["low", "medium", "high"]);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { title, description, subject, topics, skills, urgency, creatorId } = body;

  if (!title?.trim() || !description?.trim() || !subject?.trim()) {
    return NextResponse.json(
      { error: "title, description and subject are required" },
      { status: 400 }
    );
  }
  if (!creatorId || !ObjectId.isValid(creatorId)) {
    return NextResponse.json({ error: "A valid creatorId is required" }, { status: 400 });
  }
  const resolvedUrgency = URGENCIES.has(urgency) ? urgency : "medium";

  const db = await getDb();
  const doc = {
    title: title.trim().slice(0, 200),
    description: description.trim().slice(0, 2000),
    subject: subject.trim(),
    topics: toStringArray(topics),
    skills: toStringArray(skills),
    urgency: resolvedUrgency,
    creatorId,
    status: "open" as const,
    createdAt: new Date(),
  };

  const result = await db.collection("requests").insertOne(doc);

  return NextResponse.json(serialize({ _id: result.insertedId, ...doc }), { status: 201 });
}
