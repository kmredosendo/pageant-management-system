import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { name, date, status } = await req.json();
  const { id } = await params;
  if (!name || !date || !id) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const event = await prisma.event.update({
    where: { id: Number(id) },
    data: { name, date: new Date(date), ...(status && { status }) },
  });
  return NextResponse.json(event);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await prisma.event.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
