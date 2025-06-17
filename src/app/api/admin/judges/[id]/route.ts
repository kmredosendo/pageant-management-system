import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Update judge by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { number, name } = await req.json();
  if (!number || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  try {
    const judge = await prisma.judge.update({
      where: { id },
      data: { number: Number(number), name },
    });
    return NextResponse.json(judge);
  } catch {
    return NextResponse.json({ error: "Failed to update judge" }, { status: 500 });
  }
}

// Delete judge by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    await prisma.judge.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete judge" }, { status: 500 });
  }
}

// PATCH: lock/unlock judge
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { locked } = await req.json();
  if (typeof locked !== "boolean") {
    return NextResponse.json({ error: "Missing or invalid 'locked' field" }, { status: 400 });
  }
  try {
    const judge = await prisma.judge.update({
      where: { id },
      data: { locked },
    });
    return NextResponse.json(judge);
  } catch {
    return NextResponse.json({ error: "Failed to update judge lock state" }, { status: 500 });
  }
}
