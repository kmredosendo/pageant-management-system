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

  useEffect(() => {
    fetch("/api/admin/judges")
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
      });
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
            <div className="text-center text-muted-foreground">Loading judges...</div>
          ) : (
            <div className="flex flex-col gap-4">
              {judges.map((judge) => (
                <div key={judge.id} className="flex items-center justify-between border-b py-2">
                  <div className="flex flex-col">
                    <span className="font-semibold">Judge #{judge.number}</span>
                    <span className="text-muted-foreground text-xs">{judge.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={lockState[judge.id]}
                      onCheckedChange={() => handleLockToggle(judge.id)}
                      className="mr-2"
                    />
                    <span className="text-xs mr-4">{lockState[judge.id] ? "Locked" : "Unlocked"}</span>
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
                </div>
              ))}
            </div>
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
