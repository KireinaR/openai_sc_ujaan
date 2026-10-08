import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: requestId } = await params;
  if (!ObjectId.isValid(requestId)) {
    return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const { responderId, message } = body ?? {};

  if (!responderId || !ObjectId.isValid(responderId)) {
    return NextResponse.json({ error: "A valid responderId is required" }, { status: 400 });
  }
  if (!message?.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const db = await getDb();
  const request = await db.collection("requests").findOne({ _id: new ObjectId(requestId) });
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const offerDoc = {
    requestId,
    responderId,
    message: message.trim().slice(0, 1000),
    createdAt: new Date(),
  };
  const result = await db.collection("offers").insertOne(offerDoc);

  if (request.creatorId !== responderId) {
    const responder = await db
      .collection("users")
      .findOne({ _id: new ObjectId(responderId) }, { projection: { name: 1 } });

    await db.collection("notifications").insertOne({
      userId: request.creatorId,
      type: "offer",
      message: `${responder?.name ?? "A student"} responded to your request "${request.title}"`,
      link: `/requests/${requestId}`,
      read: false,
      createdAt: new Date(),
    });
  }

  return NextResponse.json(serialize({ _id: result.insertedId, ...offerDoc }), { status: 201 });
}
