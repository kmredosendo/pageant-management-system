"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminNav } from "@/components/admin-nav";
import { ActiveEventLabel } from "@/components/active-event-label";
import { Eye } from "lucide-react";
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
            <ul className="space-y-2">
              {judges.map((judge) => (
                <li
                  key={judge.id}
                  className="flex items-center justify-between bg-background rounded-md border p-4 shadow-sm"
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
                      onClick={() => window.open(`/admin/scores/print/${judge.id}`, '_blank')}
                      title="Print Raw Scores"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-8 0h8v4H6v-4z" /></svg>
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
              <div>
                <RawScoresTable judgeId={selectedJudge.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
