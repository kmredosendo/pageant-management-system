import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Get all scores for a category (sum of all sub-criterias) for the active event, grouped by contestant
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const identifier = searchParams.get("category");
  if (!identifier) {
    return NextResponse.json({ error: "Missing category identifier" }, { status: 400 });
  }

  // Find the active event
  const event = await prisma.event.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { date: "desc" },
    select: {
      id: true,
      name: true,
      date: true,
      institutionName: true,
      institutionAddress: true,
      venue: true,
    },
  });
  if (!event) return NextResponse.json({ error: "No active event" }, { status: 400 });

  // Find the category criteria for this event
  const categoryCriteria = await prisma.criteria.findFirst({
    where: { eventId: event.id, identifier },
  });
  if (!categoryCriteria) return NextResponse.json({ error: "Category criteria not found" }, { status: 404 });

  // Find all sub-criterias of the category
  const subCriterias = await prisma.criteria.findMany({
    where: { parentId: categoryCriteria.id },
    select: { id: true },
  });
  const subCriteriaIds = subCriterias.map(c => c.id);
  if (subCriteriaIds.length === 0) {
    return NextResponse.json({ event, criteria: categoryCriteria, contestants: [] });
  }

  // Get all scores for these sub-criterias
  const scores = await prisma.score.findMany({
    where: { eventId: event.id, criteriaId: { in: subCriteriaIds } },
    include: { contestant: true, judge: true },
  });

  // Group and sum scores by contestant and judge
  const grouped: Record<number, { contestantId: number; contestantName: string; scores: { judgeId: number; judgeName: string; value: number }[] }> = {};
  const sumMap: Record<number, Record<number, number>> = {};
  const judgeNames: Record<number, string> = {};
  for (const s of scores) {
    if (!sumMap[s.contestantId]) sumMap[s.contestantId] = {};
    if (!sumMap[s.contestantId][s.judgeId]) sumMap[s.contestantId][s.judgeId] = 0;
    sumMap[s.contestantId][s.judgeId] += s.value;
    judgeNames[s.judgeId] = s.judge.name;
  }
  for (const contestantId in sumMap) {
    const contestantName = scores.find(s => s.contestantId === Number(contestantId))?.contestant.name || "";
    grouped[contestantId] = {
      contestantId: Number(contestantId),
      contestantName,
      scores: Object.entries(sumMap[contestantId]).map(([judgeId, value]) => ({
        judgeId: Number(judgeId),
        judgeName: judgeNames[Number(judgeId)],
        value,
      })),
    };
  }

  return NextResponse.json({
    event,
    criteria: { id: categoryCriteria.id, name: categoryCriteria.name, identifier: categoryCriteria.identifier },
    contestants: Object.values(grouped),
  });
}
