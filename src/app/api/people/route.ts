import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const department = searchParams.get("department")?.trim();
  const year = searchParams.get("year")?.trim();
  const skills = parseList(searchParams.get("skills"));
  const subjects = parseList(searchParams.get("subjects"));

  const filter: Record<string, unknown> = {};
  if (department) filter.department = department;
  if (year) filter.year = Number(year);
  if (skills.length) {
    filter.skills = { $in: skills.map((s) => new RegExp(s, "i")) };
  }
  if (subjects.length) {
    filter.subjects = { $in: subjects.map((s) => new RegExp(s, "i")) };
  }
  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { name: regex },
      { bio: regex },
      { skills: regex },
      { subjects: regex },
      { canHelpWith: regex },
      { learning: regex },
    ];
  }

  const db = await getDb();
  const docs = await db.collection("users").find(filter).sort({ name: 1 }).toArray();
  return NextResponse.json(serialize(docs));
}
