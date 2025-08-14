"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminNav } from "@/components/admin-nav";
import { ActiveEventLabel } from "@/components/active-event-label";
import { Printer, Eye } from "lucide-react";
import { RawScoresTable } from "@/components/RawScoresTable";

interface Event {
  id: number;
  name: string;
  date: string;
  status: string;
}

interface Judge {
  id: number;
  name: string;
  number: string;
  locked: boolean;
}

export default function AdminScoresPage() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockState, setLockState] = useState<{ [id: number]: boolean }>({});
  const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null);
  const [rawDialogOpen, setRawDialogOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  // Fetch judges for the current event
  const fetchJudges = (eventId: number) => {
    setLoading(true);
    fetch(`/api/admin/judges?eventId=${eventId}`)
      .then((res) => res.json())
      .then((data: Judge[]) => {
        setJudges(data);
        setLockState(
          data.reduce((acc: { [id: number]: boolean }, j) => {
            acc[j.id] = j.locked;
            return acc;
          }, {})
        );
        setLoading(false);
      })
      .catch(() => {
        setJudges([]);
        setLockState({});
        setLoading(false);
      });
  };

  // Always fetch active event from API
  useEffect(() => {
    async function loadActiveEvent() {
      const res = await fetch("/api/admin/events/active");
      const data = await res.json();
      if (data.length > 0) {
        setActiveEvent(data[0]);
        fetchJudges(data[0].id);
      } else {
        setActiveEvent(null);
        setJudges([]);
        setLockState({});
        setLoading(false);
      }
    }
    loadActiveEvent();
  }, []);

  const handleLockToggle = (judgeId: number) => {
    const newLocked = !lockState[judgeId];
    setLockState((prev) => ({ ...prev, [judgeId]: newLocked }));
    fetch(`/api/admin/judges/${judgeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locked: newLocked }),
    });
  };

  const handleViewRaw = (judge: Judge) => {
    setSelectedJudge(judge);
    setRawDialogOpen(true);
  };

  const handlePrintBlank = (judge: Judge) => {
    window.open(`/admin/scores/blank?judgeId=${judge.id}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center py-10 px-2 sm:px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-col gap-2 items-stretch">
          <AdminNav />
          <ActiveEventLabel />
          <hr className="my-2" />
          <CardTitle className="flex items-center gap-2">Scores Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-10">Loading...</div>
          ) : !activeEvent ? (
            <div className="text-center text-muted-foreground py-10">No active event selected.</div>
          ) : judges.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">No judges found.</div>
          ) : (
            <ul className="space-y-4">
              {judges.map((judge) => (
                <li
                  key={judge.id}
                  className="flex items-center justify-between bg-background rounded-md p-4 shadow-sm"
                >
                  <div>
                    <div className="font-semibold">
                      #{judge.number} {judge.name}
                      {Number(judge.number) === 1 && " (Chief Judge)"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={lockState[judge.id]}
                      onCheckedChange={() => handleLockToggle(judge.id)}
                      className="mr-2"
                    />
                    <span className="text-xs mr-4">
                      {lockState[judge.id] ? "Locked" : "Unlocked"}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewRaw(judge)}
                      title="View Raw Scores"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePrintBlank(judge)}
                      title="Print Blank Scoresheet"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Dialog open={rawDialogOpen} onOpenChange={setRawDialogOpen}>
        <DialogContent
          className="max-w-7xl w-[75vw] p-0"
          style={{ maxWidth: '75vw', width: '75vw' }}
        >
          <DialogHeader className="px-8 pt-8 pb-2 flex flex-row items-center justify-between">
            <DialogTitle className="text-lg">
              Raw Scores for Judge {selectedJudge?.number} - {selectedJudge?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedJudge && (
            <div className="relative p-8 pt-2 overflow-auto print:p-0 print:pt-0" style={{ maxHeight: '80vh' }}>
              {/* Print header, table, and footer: always rendered, but only visible in print */}
              <div id="print-rawscore" className="print:block hidden fixed top-0 left-0 w-full min-h-screen bg-white z-[99999] p-0 m-0">
                <div className="flex flex-col items-center mb-4 mt-4">
                  <img src="/file.svg" alt="Institution Logo" width={80} height={80} className="mb-2" />
                  <h1 className="text-2xl font-bold mb-1">Institution Name</h1>
                  <h2 className="text-lg font-semibold mb-1">Pageant Raw Scores</h2>
                  <div className="text-base font-medium">Event: {activeEvent?.name}</div>
                  <div className="text-base font-medium">Judge: #{selectedJudge.number} {selectedJudge.name}</div>
                </div>
                <RawScoresTable judgeId={selectedJudge.id} />
                <div className="mt-8 text-center text-xs text-muted-foreground">Printed on {new Date().toLocaleString()}</div>
              </div>
              {/* On screen: normal dialog content */}
              <div className="print:hidden">
                <RawScoresTable judgeId={selectedJudge.id} />
                <div className="flex justify-end mt-4 no-print">
                  <Button
                    variant="default"
                    onClick={() => window.print()}
                  >
                    <Printer className="w-4 h-4 mr-2" /> Print / Save as PDF
                  </Button>
                </div>
              </div>
              <style>{`
                @media print {
                  html, body {
                    background: white !important;
                    padding: 0 !important;
                    margin: 0 !important;
                  }
                  .print-bg-white, .DialogContent, .DialogHeader, .DialogTitle, .Dialog, .dialog-close, .no-print, .print\:hidden, .overflow-auto, .p-8, .pt-2, .relative, [class*="Dialog"] {
                    display: none !important;
                  }
                  #print-rawscore {
                    display: block !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    min-height: 100vh !important;
                    background: white !important;
                    z-index: 99999 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  #print-rawscore > div {
                    margin-top: 1.5rem !important;
                  }
                }
              `}</style>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
