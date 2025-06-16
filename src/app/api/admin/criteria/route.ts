import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: List all main criteria and their sub-criteria for the active event
export async function GET() {
  // Get active event
  const event = await prisma.event.findFirst({ where: { status: "ACTIVE" }, orderBy: { date: "desc" } });
  if (!event) return NextResponse.json({ error: "No active event" }, { status: 400 });

  // Get all main criteria and their sub-criteria for the event
  const mainCriterias = await prisma.criteria.findMany({
    where: { eventId: event.id, parentId: null },
    include: {
      subCriterias: true,
    },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(mainCriterias);
}

// POST: Create a main or sub-criteria
export async function POST(req: NextRequest) {
  const body = await req.json();
  // Required: name, eventId (optional if using active), weight (for sub), parentId (for sub), autoAssignToAllContestants (for sub)
  const event = await prisma.event.findFirst({ where: { status: "ACTIVE" }, orderBy: { date: "desc" } });
  if (!event) return NextResponse.json({ error: "No active event" }, { status: 400 });

  const { name, weight, parentId, autoAssignToAllContestants } = body;
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  // If parentId is set, it's a sub-criteria
  const criteria = await prisma.criteria.create({
    data: {
      name,
      weight: parentId ? Number(weight) : null,
      eventId: event.id,
      parentId: parentId ?? null,
      autoAssignToAllContestants: !!autoAssignToAllContestants,
    },
  });
  return NextResponse.json(criteria);
}

// PUT: Update a criteria (main or sub)
export async function PUT(req: NextRequest) {
  const { id, name, weight, autoAssignToAllContestants } = await req.json();
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const data: Partial<{ name: string; weight: number; autoAssignToAllContestants: boolean }> = { name };
  if (weight !== undefined) data.weight = Number(weight);
  if (autoAssignToAllContestants !== undefined) data.autoAssignToAllContestants = !!autoAssignToAllContestants;
  const updated = await prisma.criteria.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// DELETE: Delete a criteria (main or sub)
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  await prisma.criteria.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
