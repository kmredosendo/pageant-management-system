import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Returns all raw scores for the active event, grouped by contestant and judge
export async function GET() {
  const event = await prisma.event.findFirst({ where: { status: "ACTIVE" }, orderBy: { date: "desc" } });
  if (!event) return NextResponse.json([]);

  // Get all contestants and judges for the event
  const [contestants, judges, criteria] = await Promise.all([
    prisma.contestant.findMany({ where: { eventId: event.id } }),
    prisma.judge.findMany({ where: { eventId: event.id } }),
    prisma.criteria.findMany({ where: { eventId: event.id } }),
  ]);

  // Get all scores for the event
  const scores = await prisma.score.findMany({
    where: { eventId: event.id },
    include: { contestant: true, judge: true, criteria: true },
  });

  // Structure: [{ contestantId, contestantName, judgeId, judgeNumber, judgeName, criteriaId, criteriaName, value }]
  const raw = scores.map(s => ({
    contestantId: s.contestantId,
    contestantName: s.contestant.name,
    judgeId: s.judgeId,
    judgeNumber: s.judge.number,
    judgeName: s.judge.name,
    criteriaId: s.criteriaId,
    criteriaName: s.criteria.name,
    criteriaIdentifier: s.criteria.identifier,
    value: s.value,
  }));

  return NextResponse.json({
    event: { id: event.id, name: event.name, date: event.date },
    contestants,
    judges,
    criteria,
    scores: raw,
  });
}
