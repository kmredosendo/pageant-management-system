import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const contestants = await prisma.contestant.findMany({ orderBy: { number: "asc" } });
  return NextResponse.json(contestants);
}

export async function POST(req: NextRequest) {
  const { number, name, sex, eventId } = await req.json();
  if (!number || !name || !eventId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const contestant = await prisma.contestant.create({
    data: {
      number: Number(number),
      name,
      sex: sex || null,
      eventId: Number(eventId),
    },
  });
  return NextResponse.json(contestant);
}
