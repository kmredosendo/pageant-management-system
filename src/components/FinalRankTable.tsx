import React, { useEffect, useState } from "react";

interface RawScore {
  contestantId: number;
  contestantName: string;
  judgeId: number;
  judgeNumber: number;
  judgeName: string;
  criteriaId: number;
  value: number;
}

interface Judge {
  id: number;
  name: string;
  number: number;
}

interface Contestant {
  id: number;
  name: string;
  number?: number;
}

export const FinalRankTable: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<RawScore[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/raw-scores")
      .then((res) => res.json())
      .then((data) => {
        setScores(data.scores);
        setJudges(
          data.judges
            .map((j: any) => ({ id: j.id, name: j.name, number: Number(j.number) }))
            .sort((a: Judge, b: Judge) => a.number - b.number)
        );
        setContestants(
          data.contestants
            .map((c: any) => ({ id: c.id, name: c.name, number: c.number }))
        );
        setCriteria(data.criteria);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="py-8 text-center">Loading...</div>;

  // Only use sub-criteria (criteria with parentId)
  const subCriteriaIds = criteria.filter((c) => c.parentId).map((c) => c.id);

  // For each judge and contestant, sum all sub-criteria scores
  const judgeScores: Record<number, { contestantId: number; value: number }[]> = {};
  judges.forEach((judge) => {
    judgeScores[judge.id] = contestants.map((c) => {
      const total = scores
        .filter((s) => s.judgeId === judge.id && s.contestantId === c.id && subCriteriaIds.includes(s.criteriaId))
        .reduce((sum, s) => sum + s.value, 0);
      return { contestantId: c.id, value: total };
    });
  });

  // For each judge, compute ranks (dense ranking)
  const judgeRanks: Record<number, Record<number, number>> = {};
  judges.forEach((judge) => {
    const arr = [...judgeScores[judge.id]];
    arr.sort((a, b) => b.value - a.value);
    let rank = 1;
    for (let i = 0; i < arr.length; ) {
      const tieValue = arr[i].value;
      let tieEnd = i;
      while (tieEnd + 1 < arr.length && arr[tieEnd + 1].value === tieValue) {
        tieEnd++;
      }
      for (let j = i; j <= tieEnd; j++) {
        if (!judgeRanks[judge.id]) judgeRanks[judge.id] = {};
        judgeRanks[judge.id][arr[j].contestantId] = rank;
      }
      rank += (tieEnd - i + 1);
      i = tieEnd + 1;
    }
  });


  // For each contestant, sum their ranks and total scores across all judges
  type Row = {
    id: number;
    name: string;
    number: number;
    ranks: number[];
    totalRank: number;
    totalScore: number;
    finalRank?: number;
  };
  const contestantRows: Row[] = contestants.map((c) => {
    const ranks = judges.map((j) => judgeRanks[j.id]?.[c.id] ?? "");
    const totalRank = ranks.reduce((sum, r) => sum + (typeof r === "number" ? r : 0), 0);
    // Sum all sub-criteria scores for this contestant (all judges)
    const totalScore = scores
      .filter((s) => s.contestantId === c.id && subCriteriaIds.includes(s.criteriaId))
      .reduce((sum, s) => sum + s.value, 0);
    return {
      id: c.id,
      name: c.name,
      number: c.number ?? 0,
      ranks,
      totalRank,
      totalScore,
    };
  });

  // Sort by totalRank ascending
  contestantRows.sort((a, b) => a.totalRank - b.totalRank);


  // Assign final rank (dense ranking, ties share the same rank)
  let prevRank = 1;
  let prevTotalRank: number | null = null;
  contestantRows.forEach((row, idx) => {
    if (prevTotalRank !== null && row.totalRank === prevTotalRank) {
      row.finalRank = prevRank;
    } else {
      row.finalRank = idx + 1;
      prevRank = idx + 1;
    }
    prevTotalRank = row.totalRank;
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1">No</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Total Score</th>
            <th className="border px-2 py-1">Total Rank</th>
            <th className="border px-2 py-1">Final Rank</th>
          </tr>
        </thead>
        <tbody>
          {contestantRows.map((row, idx) => {
            let rowClass = "";
            // Highlight top 3
            if (row.finalRank === 1) rowClass = "bg-yellow-100 font-bold";
            else if (row.finalRank === 2) rowClass = "bg-gray-200 font-semibold";
            else if (row.finalRank === 3) rowClass = "bg-orange-100 font-semibold";
            return (
              <tr key={row.id} className={rowClass}>
                <td className="border px-2 py-1 text-center">{row.number || idx + 1}</td>
                <td className="border px-2 py-1">{row.name}</td>
                <td className="border px-2 py-1 text-center font-bold">{row.totalScore.toFixed(2)}</td>
                <td className="border px-2 py-1 text-center font-bold">{row.totalRank}</td>
                <td className="border px-2 py-1 text-center font-bold">{row.finalRank}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
