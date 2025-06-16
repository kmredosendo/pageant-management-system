import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const events = await prisma.event.findMany({
    where: { status: "ACTIVE" },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(events);
}
