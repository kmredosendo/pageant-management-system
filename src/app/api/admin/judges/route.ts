import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const judges = await prisma.judge.findMany({ orderBy: { number: "asc" } });
  return NextResponse.json(judges);
}

// Helper to get the active event
async function getActiveEventId() {
  const event = await prisma.event.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { date: "desc" },
  });
  return event?.id;
}

export async function POST(req: NextRequest) {
  const { number, name } = await req.json();
  if (!number || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const eventId = await getActiveEventId();
  if (!eventId) {
    return NextResponse.json({ error: "No active event found" }, { status: 400 });
  }
  const judge = await prisma.judge.create({
    data: {
      number: Number(number),
      name,
      eventId,
    },
  });
  return NextResponse.json(judge);
}
