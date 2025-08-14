
"use client";
import React from "react";


import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Medal, Star, Mic, Users, ListOrdered, User, Eye, Printer } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { ActiveEventLabel } from "@/components/active-event-label";

export default function AdminResultsPage() {
  // State for Best in Talent dialog
  const [talentOpen, setTalentOpen] = useState(false);
  const [talentLoading, setTalentLoading] = useState(false);
  const [talentData, setTalentData] = useState<null | {
    event: { id: number; name: string; date: string };
    criteria: { id: number; name: string; identifier: string };
    contestants: Array<{
      contestantId: number;
      contestantName: string;
      scores: Array<{ judgeId: number; judgeName: string; value: number }>;
    }>;
  }>(null);
  useEffect(() => {
    if (talentOpen && !talentData && !talentLoading) {
      setTalentLoading(true);
      fetch("/api/talent-scores")
        .then((res) => res.json())
        .then((data) => {
          setTalentData(data);
          setTalentLoading(false);
        })
        .catch(() => setTalentLoading(false));
    }
    if (!talentOpen) {
      setTalentData(null);
      setTalentLoading(false);
    }
  }, [talentOpen]);

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center py-10 px-2 sm:px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-col gap-2 items-stretch">
          <AdminNav />
          <ActiveEventLabel />
          <hr className="my-2" />
          <CardTitle className="flex items-center gap-2">
            <Medal className="w-5 h-5" /> Results
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2">
          {/* Sub-cards for result categories, compact style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
            {/* Best in Talent */}
            <Card className="w-full p-1">
              <div className="flex flex-row items-center justify-between gap-2 p-1">
                <div className="flex flex-row items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-base font-semibold">Best in Talent</span>
                </div>
                <div className="flex gap-1">
                  <Dialog open={talentOpen} onOpenChange={setTalentOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="View" title="View Talent Results">
                        <Eye />
                      </Button>
                    </DialogTrigger>
                    {talentOpen && (
                      <DialogContent
                        className="max-w-7xl w-[75vw]"
                        style={{ maxWidth: '75vw', width: '75vw' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <DialogTitle>Best in Talent</DialogTitle>
                        </div>
                        {talentLoading ? (
                          <div className="py-4 text-center text-muted-foreground">Loading...</div>
                        ) : talentData && talentData.contestants.length > 0 ? (
                          <div className="overflow-x-auto">
                            {/* ...existing table code... */}
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
                                {/* Table body rendering, fixed for JSX and key issues */}
                                {(() => {
                                  const contestants = talentData.contestants.map(c => ({
                                    ...c,
                                    total: c.scores.reduce((sum, s) => sum + s.value, 0),
                                    number: (() => {
                                      const match = c.contestantName.match(/^#?(\d+)/);
                                      return match ? Number(match[1]) : 0;
                                    })()
                                  })).sort((a, b) => a.number - b.number);

                                  const judgeIds: number[] = [];
                                  for (const c of contestants) {
                                    for (const s of c.scores) {
                                      if (!judgeIds.includes(s.judgeId)) judgeIds.push(s.judgeId);
                                      if (judgeIds.length === 5) break;
                                    }
                                    if (judgeIds.length === 5) break;
                                  }
                                  const judgeScores: Record<number, {contestantId: number, value: number}[]> = {};
                                  for (const judgeId of judgeIds) {
                                    judgeScores[judgeId] = contestants.map(c => {
                                      const found = c.scores.find(s => s.judgeId === judgeId);
                                      return { contestantId: c.contestantId, value: found ? found.value : 0 };
                                    });
                                  }
                                  const judgeRanks: Record<number, Record<number, number>> = {};
                                  for (const judgeId of judgeIds) {
                                    const arr = [...judgeScores[judgeId]];
                                    arr.sort((a, b) => b.value - a.value);
                                    judgeRanks[judgeId] = {};
                                    let i = 0;
                                    while (i < arr.length) {
                                      const tieValue = arr[i].value;
                                      const tieStart = i;
                                      let tieEnd = i;
                                      while (tieEnd + 1 < arr.length && arr[tieEnd + 1].value === tieValue) {
                                        tieEnd++;
                                      }
                                      const avgRank = (tieStart + 1 + tieEnd + 1) / 2;
                                      for (let j = tieStart; j <= tieEnd; j++) {
                                        judgeRanks[judgeId][arr[j].contestantId] = avgRank;
                                      }
                                      i = tieEnd + 1;
                                    }
                                  }
                                  const totalRanks = contestants.map(c => {
                                    let total = 0;
                                    for (let i = 0; i < judgeIds.length; i++) {
                                      total += judgeRanks[judgeIds[i]][c.contestantId] || 0;
                                    }
                                    return { contestantId: c.contestantId, total };
                                  });
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
                                  return contestants.map((c, idx) => (
                                    <tr key={c.contestantId} className={finalRankMap[c.contestantId] === 1 ? "bg-yellow-100 font-bold" : ""}>
                                      <td className="border px-2 py-1">{c.number || idx + 1}</td>
                                      {judgeIds.map((judgeId, jIdx) => (
                                        <React.Fragment key={`judge-${jIdx}`}>
                                          <td className="border px-2 py-1 text-center">{(c.scores.find(s => s.judgeId === judgeId)?.value ?? 0)}</td>
                                          <td className="border px-2 py-1 text-center">{judgeRanks[judgeId][c.contestantId]?.toFixed(1) ?? ''}</td>
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
                                  ));
                                })()}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="py-4 text-center text-muted-foreground">No scores found.</div>
                        )}
                      </DialogContent>
                    )}
                  </Dialog>
                  <Button variant="outline" size="icon" aria-label="Print" title="Print Talent Results">
                    <Printer />
                  </Button>
                </div>
              </div>
            </Card>
            {/* Best in Interview */}
            <Card className="w-full p-1">
              <div className="flex flex-row items-center justify-between gap-2 p-1">
                <div className="flex flex-row items-center gap-1">
                  <Mic className="w-5 h-5 text-blue-500" />
                  <span className="text-base font-semibold">Best in Interview</span>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="View" title="View Interview Results">
                        <Eye />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="flex items-center gap-2 mb-2">
                        <Mic className="w-5 h-5 text-blue-500" />
                        <DialogTitle>Best in Interview</DialogTitle>
                      </div>
                      {/* Dialog content for Best in Interview goes here */}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="icon" aria-label="Print" title="Print Interview Results">
                    <Printer />
                  </Button>
                </div>
              </div>
            </Card>
            {/* Rank per Judge */}
            <Card className="w-full p-1">
              <div className="flex flex-row items-center justify-between gap-2 p-1">
                <div className="flex flex-row items-center gap-1">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="text-base font-semibold">Rank per Judge</span>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="View" title="View Rank per Judge">
                        <Eye />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-green-500" />
                        <DialogTitle>Rank per Judge</DialogTitle>
                      </div>
                      {/* Dialog content for Rank per Judge goes here */}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="icon" aria-label="Print" title="Print Rank per Judge">
                    <Printer />
                  </Button>
                </div>
              </div>
            </Card>
            {/* Final Rank */}
            <Card className="w-full p-1">
              <div className="flex flex-row items-center justify-between gap-2 p-1">
                <div className="flex flex-row items-center gap-1">
                  <ListOrdered className="w-5 h-5 text-purple-500" />
                  <span className="text-base font-semibold">Final Rank</span>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="View" title="View Final Rank">
                        <Eye />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="flex items-center gap-2 mb-2">
                        <ListOrdered className="w-5 h-5 text-purple-500" />
                        <DialogTitle>Final Rank</DialogTitle>
                      </div>
                      {/* Dialog content for Final Rank goes here */}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="icon" aria-label="Print" title="Print Final Rank">
                    <Printer />
                  </Button>
                </div>
              </div>
            </Card>
            {/* Contestant Rank */}
            <Card className="w-full p-1">
              <div className="flex flex-row items-center justify-between gap-2 p-1">
                <div className="flex flex-row items-center gap-1">
                  <User className="w-5 h-5 text-pink-500" />
                  <span className="text-base font-semibold">Contestant Rank</span>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="View" title="View Contestant Rank">
                        <Eye />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-pink-500" />
                        <DialogTitle>Contestant Rank</DialogTitle>
                      </div>
                      {/* Dialog content for Contestant Rank goes here */}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="icon" aria-label="Print" title="Print Contestant Rank">
                    <Printer />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
