import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";

// Lightweight list used by the "browsing as" demo-identity switcher.
export async function GET() {
  const db = await getDb();
  const docs = await db
    .collection("users")
    .find({}, { projection: { name: 1, department: 1, year: 1 } })
    .sort({ name: 1 })
    .toArray();
  return NextResponse.json(serialize(docs));
}
