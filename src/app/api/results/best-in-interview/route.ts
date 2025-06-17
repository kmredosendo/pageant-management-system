import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This assumes you have an 'Interview' criteria or event. Adjust as needed.
export async function GET() {
  // Find the main criteria with the identifier 'best-in-interview' for the active event
  const event = await prisma.event.findFirst({ where: { status: "ACTIVE" }, orderBy: { date: "desc" } });
  if (!event) return NextResponse.json(null);
  const mainCriteria = await prisma.criteria.findFirst({
    where: { eventId: event.id, parentId: null, identifier: "best-in-interview" },
  });
  if (!mainCriteria) return NextResponse.json(null);
  // Find all sub-criteria IDs (including the main)
  const subCriterias = await prisma.criteria.findMany({ where: { parentId: mainCriteria.id } });
  const criteriaIds = [mainCriteria.id, ...subCriterias.map(c => c.id)];
  // Aggregate scores for each contestant for these criteria
  const scores = await prisma.score.groupBy({
    by: ["contestantId"],
    where: { criteriaId: { in: criteriaIds }, eventId: event.id },
    _sum: { value: true },
  });
  if (!scores.length) return NextResponse.json(null);
  // Find the contestant with the highest total
  // Defensive: handle empty or undefined _sum.value
  const best = scores.reduce((a, b) => ((b._sum.value ?? 0) > (a._sum.value ?? 0) ? b : a));
  const contestant = best && best.contestantId ? await prisma.contestant.findUnique({ where: { id: best.contestantId } }) : null;
  if (!contestant) return NextResponse.json(null);
  return NextResponse.json({
    contestantId: contestant.id,
    contestantName: contestant.name,
    score: best._sum.value ?? 0,
  });
}
