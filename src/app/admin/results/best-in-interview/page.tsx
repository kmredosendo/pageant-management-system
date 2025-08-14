"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface Event {
  id: number;
  name: string;
  date: string;
  status: string;
}

interface Result {
  contestantId: number;
  contestantName: string;
  score: number;
}

export default function BestInInterviewResult() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  const fetchResult = (eventId: number) => {
    setLoading(true);
    fetch(`/api/results/best-in-interview?eventId=${eventId}`)
      .then(res => res.json())
      .then(data => {
        setResult(data);
        setLoading(false);
      })
      .catch(() => {
        setResult(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    async function loadActiveEvent() {
      const res = await fetch("/api/admin/events/active");
      const data = await res.json();
      if (data.length > 0) {
        setActiveEvent(data[0]);
        fetchResult(data[0].id);
      } else {
        setActiveEvent(null);
        setResult(null);
        setLoading(false);
      }
    }
    loadActiveEvent();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted py-10 px-2">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-col items-center gap-2">
          <Trophy className="w-8 h-8 text-blue-500" />
          <CardTitle className="text-2xl">Best in Interview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {loading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : !activeEvent ? (
            <div className="text-muted-foreground">No active event selected.</div>
          ) : result ? (
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{result.contestantName}</div>
              <div className="text-sm text-muted-foreground">Score: {result.score}</div>
            </div>
          ) : (
            <div className="text-muted-foreground">No result available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
