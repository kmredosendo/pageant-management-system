import React from "react";

// ...existing code...

interface Contestant {
  contestantId: number;
  contestantName: string;
  scores: Array<{ judgeId: number; judgeName: string; value: number }>;
}

interface CategoryRankTableProps {
  contestants: Contestant[];
}

export function CategoryRankTable({ contestants }: CategoryRankTableProps) {
  // Prepare data for ranking per judge
  const processed = contestants.map(c => ({
    ...c,
    total: c.scores.reduce((sum, s) => sum + s.value, 0),
    number: (() => {
      const match = c.contestantName.match(/^#?(\d+)/);
      return match ? Number(match[1]) : 0;
    })()
  })).sort((a, b) => a.number - b.number);

  // Get all judgeIds in order of appearance (up to 5)
  const judgeIds: number[] = [];
  for (const c of processed) {
    for (const s of c.scores) {
      if (!judgeIds.includes(s.judgeId)) judgeIds.push(s.judgeId);
      if (judgeIds.length === 5) break;
    }
    if (judgeIds.length === 5) break;
  }
  // Build a map: judgeId -> array of {contestantId, value}
  const judgeScores: Record<number, {contestantId: number, value: number}[]> = {};
  for (const judgeId of judgeIds) {
    judgeScores[judgeId] = processed.map(c => {
      const found = c.scores.find(s => s.judgeId === judgeId);
      return { contestantId: c.contestantId, value: found ? found.value : 0 };
    });
  }
  // For each judge, compute dense ranking (ties share the same rank, next rank increments by 1)
  const judgeRanks: Record<number, Record<number, number>> = {};
  for (const judgeId of judgeIds) {
    const arr = [...judgeScores[judgeId]];
    arr.sort((a, b) => b.value - a.value);
    judgeRanks[judgeId] = {};
    let rank = 1;
    for (let i = 0; i < arr.length; ) {
      const tieValue = arr[i].value;
      let tieEnd = i;
      while (tieEnd + 1 < arr.length && arr[tieEnd + 1].value === tieValue) {
        tieEnd++;
      }
      for (let j = i; j <= tieEnd; j++) {
        judgeRanks[judgeId][arr[j].contestantId] = rank;
      }
      rank += (tieEnd - i + 1);
      i = tieEnd + 1;
    }
  }
  // For each contestant, compute total rank (sum of judge ranks)
  const totalRanks = processed.map(c => {
    let total = 0;
    for (let i = 0; i < judgeIds.length; i++) {
      total += judgeRanks[judgeIds[i]][c.contestantId] || 0;
    }
    return { contestantId: c.contestantId, total };
  });
  // Compute final rank (lowest total rank is 1, ties share rank)
  const sortedTotalRanks = [...totalRanks].sort((a, b) => a.total - b.total);
  const finalRankMap: Record<number, number> = {};
  let prevTotal = null;
  let prevRank = 1;
  for (let i = 0; i < sortedTotalRanks.length; i++) {
    if (prevTotal !== null && sortedTotalRanks[i].total === prevTotal) {
      finalRankMap[sortedTotalRanks[i].contestantId] = prevRank;
    } else {
      finalRankMap[sortedTotalRanks[i].contestantId] = i + 1;
      prevRank = i + 1;
    }
    prevTotal = sortedTotalRanks[i].total;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1" rowSpan={2}>Contestant #</th>
            {Array.from({ length: 5 }).map((_, i) => (
              <th className="border px-2 py-1 text-center" colSpan={2} key={`judge-header-${i}`}>{`Judge ${i + 1}`}</th>
            ))}
            <th className="border px-2 py-1" rowSpan={2}>Total Rank</th>
            <th className="border px-2 py-1" rowSpan={2}>Final Rank</th>
          </tr>
          <tr>
            {Array.from({ length: 5 }).flatMap((_, i) => [
              <th className="border px-2 py-1 text-center" key={`score-header-${i}`}>Score</th>,
              <th className="border px-2 py-1 text-center" key={`rank-header-${i}`}>Rank</th>
            ])}
          </tr>
        </thead>
        <tbody>
          {processed.map((c, idx) => (
            <tr key={c.contestantId} className={finalRankMap[c.contestantId] === 1 ? "bg-yellow-100 font-bold" : ""}>
              <td className="border px-2 py-1">{c.number || idx + 1}</td>
              {judgeIds.map((judgeId, jIdx) => (
                <React.Fragment key={`judge-${jIdx}`}>
                  <td className="border px-2 py-1 text-center">{(c.scores.find(s => s.judgeId === judgeId)?.value ?? 0)}</td>
                  <td className="border px-2 py-1 text-center">{judgeRanks[judgeId][c.contestantId] ?? ''}</td>
                </React.Fragment>
              ))}
              {/* Fill empty judges if less than 5 */}
              {Array.from({ length: 5 - judgeIds.length }).map((_, i) => (
                <React.Fragment key={`empty-${i}`}>
                  <td className="border px-2 py-1 text-center"></td>
                  <td className="border px-2 py-1 text-center"></td>
                </React.Fragment>
              ))}
              <td className="border px-2 py-1 text-center font-semibold">{totalRanks.find(t => t.contestantId === c.contestantId)?.total}</td>
              <td className="border px-2 py-1 text-center font-bold">{finalRankMap[c.contestantId]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
