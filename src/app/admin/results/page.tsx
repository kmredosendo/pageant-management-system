"use client";
import { ContestantBreakdownTable } from "@/components/ContestantBreakdownTable";
import React from "react";


// import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Medal, Star, Mic, Users, ListOrdered, User, Eye, Printer } from "lucide-react";
import { CategoryRankTable } from "@/components/CategoryRankTable";
import { RankPerJudgeTable } from "@/components/RankPerJudgeTable";
import { AdminNav } from "@/components/admin-nav";
import { ActiveEventLabel } from "@/components/active-event-label";
import { FinalRankTable } from "@/components/FinalRankTable";

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
    }, [talentOpen, talentData, talentLoading]);

  // State for Best in Interview dialog
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewData, setInterviewData] = useState<null | {
    event: { id: number; name: string; date: string };
    criteria: { id: number; name: string; identifier: string };
    contestants: Array<{
      contestantId: number;
      contestantName: string;
      scores: Array<{ judgeId: number; judgeName: string; value: number }>;
    }>;
  }>(null);
  useEffect(() => {
    if (interviewOpen && !interviewData && !interviewLoading) {
      setInterviewLoading(true);
      fetch("/api/interview-scores")
        .then((res) => res.json())
        .then((data) => {
          setInterviewData(data);
          setInterviewLoading(false);
        })
        .catch(() => setInterviewLoading(false));
    }
    if (!interviewOpen) {
      setInterviewData(null);
      setInterviewLoading(false);
    }
    }, [interviewOpen, interviewData, interviewLoading]);

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
                          <>
                            <CategoryRankTable contestants={talentData.contestants} />
                            <div className="flex justify-end mt-4">
                              <Button

                                onClick={() => window.open('/admin/results/print/talent', '_blank')}
                                aria-label="Print"
                                title="Print Talent Results"
                              >
                                <Printer className="mr-2" /> Print
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="py-4 text-center text-muted-foreground">No scores found.</div>
                        )}
                      </DialogContent>
                    )}
                  </Dialog>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Print"
                    title="Print Talent Results"
                    onClick={() => window.open('/admin/results/print/talent', '_blank')}
                  >
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
                  <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="View" title="View Interview Results">
                        <Eye />
                      </Button>
                    </DialogTrigger>
                    {interviewOpen && (
                      <DialogContent
                        className="max-w-7xl w-[75vw]"
                        style={{ maxWidth: '75vw', width: '75vw' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Mic className="w-5 h-5 text-blue-500" />
                          <DialogTitle>Best in Interview</DialogTitle>
                        </div>
                        {interviewLoading ? (
                          <div className="py-4 text-center text-muted-foreground">Loading...</div>
                        ) : interviewData && interviewData.contestants.length > 0 ? (
                          <>
                            <CategoryRankTable contestants={interviewData.contestants} />
                            <div className="flex justify-end mt-4">
                              <Button

                                onClick={() => window.open('/admin/results/print/interview', '_blank')}
                                aria-label="Print"
                                title="Print Interview Results"
                              >
                                <Printer className="mr-2" /> Print
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="py-4 text-center text-muted-foreground">No scores found.</div>
                        )}
                      </DialogContent>
                    )}
                  </Dialog>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Print"
                    title="Print Interview Results"
                    onClick={() => window.open('/admin/results/print/interview', '_blank')}
                  >
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
                    <DialogContent
                      className="max-w-7xl w-[75vw]"
                      style={{ maxWidth: '75vw', width: '75vw' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-green-500" />
                        <DialogTitle>Rank per Judge</DialogTitle>
                      </div>
                      <RankPerJudgeTable />
                      <div className="flex justify-end mt-4">
                        <Button
                          onClick={() => window.open('/admin/results/print/rank-per-judge', '_blank')}
                          aria-label="Print"
                          title="Print Rank per Judge"
                        >
                          <Printer className="mr-2" /> Print
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Print"
                    title="Print Rank per Judge"
                    onClick={() => window.open('/admin/results/print/rank-per-judge', '_blank')}
                  >
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
                    <DialogContent
                      className="max-w-7xl w-[75vw]"
                      style={{ maxWidth: '75vw', width: '75vw' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <ListOrdered className="w-5 h-5 text-purple-500" />
                        <DialogTitle>Final Rank</DialogTitle>
                      </div>
                      <FinalRankTable />
                      <div className="flex justify-end mt-4">
                        <Button
                          onClick={() => window.open('/admin/results/print/final-rank', '_blank')}
                          aria-label="Print"
                          title="Print Final Rank"
                        >
                          <Printer className="mr-2" /> Print
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Print"
                    title="Print Final Rank"
                    onClick={() => window.open('/admin/results/print/final-rank', '_blank')}
                  >
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
                    <DialogContent
                      className="max-w-7xl w-[75vw]"
                      style={{ maxWidth: '75vw', width: '75vw' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-pink-500" />
                        <DialogTitle>Contestant Rank</DialogTitle>
                      </div>
                      {/* Dialog content for Contestant Rank goes here */}
                      <React.Suspense fallback={<div className="py-8 text-center">Loading...</div>}>
                        {typeof window !== 'undefined' && (
                          <>
                            <ContestantBreakdownTable />
                          </>
                        )}
                      </React.Suspense>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
