import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, context: { params: Promise<Record<string, string>> }) {
  const { name, date } = await req.json();
  const params = await context.params;
  const id = Number(params.id);
  if (!name || !date || !id) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const event = await prisma.event.update({
    where: { id },
    data: { name, date: new Date(date) },
  });
  return NextResponse.json(event);
}

export async function DELETE(req: NextRequest, context: { params: Promise<Record<string, string>> }) {
  const params = await context.params;
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
