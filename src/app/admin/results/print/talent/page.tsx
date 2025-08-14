import React from "react";
import { CategoryRankTable } from "@/components/CategoryRankTable";
import { PrintHeader } from "@/components/print-header";

async function getTalentScores() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/talent-scores`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function PrintTalentResultsPage() {
  const data = await getTalentScores();
  if (!data || !data.contestants || data.contestants.length === 0) {
    return <div className="p-8 text-center">No scores found.</div>;
  }
  // Collect all unique judges from the contestants' scores
  const judgeMap = new Map();
  data.contestants.forEach((c: any) => {
    c.scores.forEach((s: any) => {
      if (!judgeMap.has(s.judgeId)) {
        judgeMap.set(s.judgeId, s.judgeName);
      }
    });
  });
  const judges = Array.from(judgeMap.entries()).map(([id, name]) => ({ id, name }));

  return (
    <div className="min-h-screen p-8 print:bg-white print:text-black flex flex-col items-center">
      <PrintHeader event={data.event || null} />
      <div className="w-full max-w-5xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Best in Talent</h1>
        <CategoryRankTable contestants={data.contestants} />
        {/* Judges Footer: 3 per row */}
        <div className="w-full mt-16 print:mt-12 flex flex-col items-center">
          {Array.from({ length: Math.ceil(judges.length / 3) }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex flex-row justify-center gap-12 mb-8 w-full">
              {judges.slice(rowIdx * 3, rowIdx * 3 + 3).map((judge, idx) => (
                <div key={judge.id} className="flex flex-col items-center w-72">
                  <div className="w-full border-t border-black mb-1" style={{ minWidth: 200 }} />
                  <div className="w-full text-center font-medium text-sm">{judge.name}</div>
                  <div className="w-full text-center text-xs text-muted-foreground mt-0.5">Judge {rowIdx * 3 + idx + 1}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
