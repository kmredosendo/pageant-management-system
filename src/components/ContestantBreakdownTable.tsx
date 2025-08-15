import React, { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { User } from "lucide-react";

interface Judge {
  id: number;
  name: string;
  number: number;
}

interface Criteria {
  id: number;
  name: string;
  identifier: string;
  parentId?: number;
}

interface Contestant {
  id: number;
  name: string;
  number: number;
}

interface Score {
  contestantId: number;
  judgeId: number;
  criteriaId: number;
  value: number;
}

export function ContestantBreakdownTable() {
  const [loading, setLoading] = useState(true);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/raw-scores")
      .then((res) => res.json())
      .then((data) => {
        setContestants(data.contestants.map((c: any) => ({ id: c.id, name: c.name, number: c.number })));
        setJudges(data.judges.map((j: any) => ({ id: j.id, name: j.name, number: Number(j.number) })));
        setCriteria(data.criteria);
        setScores(data.scores);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="py-8 text-center">Loading...</div>;

  return (
    <div>
      <div className="mb-4 max-w-xs">
        <Select value={selected ? String(selected) : undefined} onValueChange={v => setSelected(Number(v))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select contestant..." />
          </SelectTrigger>
          <SelectContent>
            {contestants.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                #{c.number} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selected && (
        <ContestantBreakdownDetail
          contestant={contestants.find((c) => c.id === selected)!}
          judges={judges}
          criteria={criteria}
          scores={scores}
        />
      )}
    </div>
  );
}

function ContestantBreakdownDetail({ contestant, judges, criteria, scores }: {
  contestant: Contestant;
  judges: Judge[];
  criteria: Criteria[];
  scores: Score[];
}) {
  // Only use main criteria (criteria without parentId)
  const mainCriteria = criteria.filter((c) => !c.parentId);

  // For each judge, compute dense ranking for all contestants
  // We'll need all scores for all contestants for each judge
  // So, for each judge, build an array of {contestantId, total}
  // We'll fetch all scores for the event from the parent component's state
  // But here, we only have scores for the selected contestant, so we need to pass all scores
  // Instead, let's fetch all scores for all contestants for each judge
  // We'll assume the parent passes all scores for the event, not just the selected contestant
  // So, let's add a prop: allScores: Score[]

  // For this implementation, let's fetch all scores for all contestants for each judge
  // We'll need to get all contestants' ids from the scores array
  // But since we only have scores for the selected contestant, we need to fetch all scores in the parent
  // For now, let's assume we have all scores in the parent

  // We'll use the scores prop as all scores for all contestants
  // For each judge, build an array of {contestantId, total}
  const allContestantIds = Array.from(new Set(scores.map(s => s.contestantId)));

  // For each judge, build a map of contestantId -> total (sum of all main criteria, where each main criteria is the sum of its sub-criteria)
  // First, build a map of main criteria id -> sub-criteria ids
  const mainToSub: Record<number, number[]> = {};
  mainCriteria.forEach(mc => {
    mainToSub[mc.id] = criteria.filter(c => c.parentId === mc.id).map(c => c.id);
  });

  const judgeTotals: Record<number, { contestantId: number; total: number }[]> = {};
  judges.forEach(j => {
    judgeTotals[j.id] = allContestantIds.map(cid => {
      // For this contestant and judge, sum all main criteria (each is sum of its sub-criteria)
      let total = 0;
      for (const mc of mainCriteria) {
        const subIds = mainToSub[mc.id];
        total += scores.filter(s => s.judgeId === j.id && s.contestantId === cid && subIds.includes(s.criteriaId)).reduce((sum, s) => sum + s.value, 0);
      }
      return { contestantId: cid, total };
    });
  });

  // For each judge, compute dense ranking
  const judgeRanks: Record<number, Record<number, number>> = {};
  judges.forEach(j => {
    const arr = [...judgeTotals[j.id]];
    arr.sort((a, b) => b.total - a.total);
    let rank = 1;
    for (let i = 0; i < arr.length; ) {
      const tieValue = arr[i].total;
      let tieEnd = i;
      while (tieEnd + 1 < arr.length && arr[tieEnd + 1].total === tieValue) {
        tieEnd++;
      }
      for (let k = i; k <= tieEnd; k++) {
        if (!judgeRanks[j.id]) judgeRanks[j.id] = {};
        judgeRanks[j.id][arr[k].contestantId] = rank;
      }
      rank += (tieEnd - i + 1);
      i = tieEnd + 1;
    }
  });

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2">#{contestant.number} {contestant.name}</h3>
      <table className="min-w-full border text-sm mb-4">
        <thead>
          <tr>
            <th className="border px-2 py-1">Judge</th>
            {mainCriteria.map((c) => (
              <th key={c.id} className="border px-2 py-1">{c.name}</th>
            ))}
            <th className="border px-2 py-1">Total</th>
            <th className="border px-2 py-1">Rank</th>
          </tr>
        </thead>
        <tbody>
          {judges.map((j) => {
            // For each main criteria, sum the sub-criteria scores for this judge and contestant
            const judgeScores = mainCriteria.map((mc) => {
              const subIds = mainToSub[mc.id];
              return scores.filter(s => s.judgeId === j.id && s.contestantId === contestant.id && subIds.includes(s.criteriaId)).reduce((sum, s) => sum + s.value, 0);
            });
            const total = judgeScores.reduce((sum, v) => sum + v, 0);
            const rank = judgeRanks[j.id]?.[contestant.id] ?? '';
            return (
              <tr key={j.id}>
                <td className="border px-2 py-1 font-medium">{j.name}</td>
                {judgeScores.map((v, idx) => (
                  <td key={idx} className="border px-2 py-1 text-center">{v.toFixed(2)}</td>
                ))}
                <td className="border px-2 py-1 text-center font-bold">{total.toFixed(2)}</td>
                <td className="border px-2 py-1 text-center font-bold">{rank}</td>
              </tr>
            );
          })}
        </tbody>
        {/* Total Score and Total Rank Row */}
        <tfoot>
          <tr>
            <td className="border px-2 py-1 font-bold text-right" colSpan={1 + mainCriteria.length}>Total Score</td>
            <td className="border px-2 py-1 text-center font-bold" colSpan={2}>
              {/* Sum all scores for this contestant across all judges and all main criteria */}
              {(() => {
                let total = 0;
                judges.forEach(j => {
                  mainCriteria.forEach(mc => {
                    const subIds = mainToSub[mc.id];
                    total += scores.filter(s => s.judgeId === j.id && s.contestantId === contestant.id && subIds.includes(s.criteriaId)).reduce((sum, s) => sum + s.value, 0);
                  });
                });
                return total.toFixed(2);
              })()}
            </td>
          </tr>
          <tr>
            <td className="border px-2 py-1 font-bold text-right" colSpan={1 + mainCriteria.length}>Total Rank</td>
            <td className="border px-2 py-1 text-center font-bold" colSpan={2}>
              {/* Sum all judge ranks for this contestant */}
              {(() => {
                let totalRank = 0;
                judges.forEach(j => {
                  const rank = judgeRanks[j.id]?.[contestant.id];
                  if (typeof rank === 'number') totalRank += rank;
                });
                return totalRank;
              })()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
