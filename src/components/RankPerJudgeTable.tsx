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

interface Criteria {
  id: number;
  parentId?: number | null;
}

interface RankPerJudgeTableProps {
  className?: string;
}

export const RankPerJudgeTable: React.FC<RankPerJudgeTableProps> = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<RawScore[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/raw-scores")
      .then((res) => res.json())
      .then((data) => {
        setScores(data.scores);
        setJudges(
          data.judges
            .map((j: { id: number, name: string, number: number }) => ({ id: j.id, name: j.name, number: Number(j.number) }))
            .sort((a: Judge, b: Judge) => a.number - b.number)
        );
        setContestants(
          data.contestants
            .map((c: { id: number, name: string, number: number }) => ({ id: c.id, name: c.name, number: c.number }))
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
      // Sum all sub-criteria scores for this contestant and judge
      const total = scores
        .filter((s) => s.judgeId === judge.id && s.contestantId === c.id && subCriteriaIds.includes(s.criteriaId))
        .reduce((sum, s) => sum + s.value, 0);
      return { contestantId: c.id, value: total };
    });
  });

  // For each judge, compute ranks (1 = highest score) using dense ranking
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

  // For each contestant, sum their ranks across all judges
  const contestantRows = contestants.map((c) => {
    const ranks = judges.map((j) => judgeRanks[j.id]?.[c.id] ?? "");
    const totalRank = ranks.reduce((sum, r) => sum + (typeof r === "number" ? r : 0), 0);
    return {
      id: c.id,
      name: c.name,
      number: c.number ?? 0,
      ranks,
      totalRank,
    };
  });

  // Sort by contestant number ascending
  contestantRows.sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

  // Find the 1st, 2nd, and 3rd place totalRanks (handle ties)
  const sortedRanks = Array.from(new Set(contestantRows.map((row) => row.totalRank))).sort((a, b) => a - b);
  const first = sortedRanks[0];
  const second = sortedRanks[1];
  const third = sortedRanks[2];

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full border text-sm ${className || ""}`}>
        <thead>
          <tr>
            <th className="border px-2 py-1">No</th>
            <th className="border px-2 py-1">Name</th>
            {judges.map((j) => (
              <th className="border px-2 py-1 text-center" key={j.id}>{`Judge ${j.number}`}</th>
            ))}
            <th className="border px-2 py-1">Total Rank</th>
            <th className="border px-2 py-1">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {contestantRows.map((row, idx) => {
            let rowClass = "";
            let place = "";
            if (row.totalRank === first) {
              rowClass = "bg-yellow-100 font-bold";
              place = "1st";
            } else if (row.totalRank === second) {
              rowClass = "bg-gray-200 font-semibold";
              place = "2nd";
            } else if (row.totalRank === third) {
              rowClass = "bg-orange-100 font-semibold";
              place = "3rd";
            }
            return (
              <tr key={row.id} className={rowClass}>
                <td className="border px-2 py-1 text-center">{row.number || idx + 1}</td>
                <td className="border px-2 py-1">{row.name}</td>
                {row.ranks.map((r, i) => (
                  <td className="border px-2 py-1 text-center" key={i}>{typeof r === "number" ? r : ""}</td>
                ))}
                <td className="border px-2 py-1 text-center font-bold">{row.totalRank}</td>
                <td className="border px-2 py-1 text-center font-bold">{place}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
