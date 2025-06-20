import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url!);
  const eventIdParam = url.searchParams.get("eventId");
  let eventId: number | undefined = undefined;
  if (eventIdParam) {
    eventId = Number(eventIdParam);
  } else {
    const event = await prisma.event.findFirst({ where: { status: "ACTIVE" }, orderBy: { date: "desc" } });
    if (!event) return NextResponse.json(null);
    eventId = event.id;
  }
  const mainCriteria = await prisma.criteria.findFirst({
    where: { eventId, parentId: null, identifier: "best-in-interview" },
  });
  if (!mainCriteria) return NextResponse.json(null);
  const subCriterias = await prisma.criteria.findMany({ where: { parentId: mainCriteria.id } });
  const criteriaIds = [mainCriteria.id, ...subCriterias.map(c => c.id)];
  const scores = await prisma.score.groupBy({
    by: ["contestantId"],
    where: { criteriaId: { in: criteriaIds }, eventId },
    _sum: { value: true },
  });
  if (!scores.length) return NextResponse.json(null);
  const best = scores.reduce((a, b) => ((b._sum.value ?? 0) > (a._sum.value ?? 0) ? b : a));
  const contestant = best && best.contestantId ? await prisma.contestant.findUnique({ where: { id: best.contestantId } }) : null;
  if (!contestant) return NextResponse.json(null);
  return NextResponse.json({
    contestantId: contestant.id,
    contestantName: contestant.name,
    score: best._sum.value ?? 0,
  });
}
