import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { name, date } = await req.json();
  if (!name || !date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const event = await prisma.event.create({
    data: {
      name,
      date: new Date(date),
    },
  });
  return NextResponse.json(event);
}

export async function GET() {
  const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(events);
}
