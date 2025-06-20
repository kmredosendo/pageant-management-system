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

  // Load active event from localStorage or API
  useEffect(() => {
    const loadActiveEvent = async () => {
      const stored = typeof window !== "undefined" ? localStorage.getItem("activeEvent") : null;
      let event: Event | null = null;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id && parsed.name && parsed.date) {
            event = parsed;
          }
        } catch {}
      }
      if (!event) {
        // fallback to API
        const res = await fetch("/api/admin/events/active");
        const data = await res.json();
        if (data.length > 0) {
          event = data[0];
        }
      }
      setActiveEvent(event);
      if (event) fetchJudges(event.id);
      else setLoading(false);
    };
    loadActiveEvent();
    // Listen for storage changes (active event changed in another tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "activeEvent") {
        const stored = e.newValue;
        let event: Event | null = null;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.id && parsed.name && parsed.date) {
              event = parsed;
            }
          } catch {}
        }
        setActiveEvent(event);
        if (event) fetchJudges(event.id);
        else {
          setJudges([]);
          setLockState({});
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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
            <div className="p-8 pt-2 overflow-auto" style={{ maxHeight: '80vh' }}>
              <RawScoresTable judgeId={selectedJudge.id} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
