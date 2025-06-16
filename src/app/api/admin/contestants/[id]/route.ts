import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { number, name, sex } = await req.json();
  const id = Number(params.id);
  if (!number || !name || !id) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const contestant = await prisma.contestant.update({
    where: { id },
    data: {
      number: Number(number),
      name,
      sex: sex || null,
    },
  });
  return NextResponse.json(contestant);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await prisma.contestant.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
