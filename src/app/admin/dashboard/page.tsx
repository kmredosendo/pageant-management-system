"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Trophy, Users, UserCheck, ListChecks } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";

type EventSummary = {
  id: number;
  name: string;
  date: string;
  status: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    event: EventSummary | null;
    contestants: number;
    judges: number;
    criteria: number;
  }>({
    event: null,
    contestants: 0,
    judges: 0,
    criteria: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Get the active event first
      const eventRes = await fetch("/api/admin/events/active").then(r => r.json());
      const event = eventRes[0] || null;
      let contestants = 0, judges = 0, criteria = 0;
      if (event) {
        const [contestantsRes, judgesRes, criteriaRes] = await Promise.all([
          fetch(`/api/admin/contestants?eventId=${event.id}`).then(r => r.json()),
          fetch(`/api/admin/judges?eventId=${event.id}`).then(r => r.json()),
          fetch(`/api/admin/criteria?eventId=${event.id}`).then(r => r.json()),
        ]);
        contestants = contestantsRes.length;
        judges = judgesRes.length;
        criteria = criteriaRes.length;
      }
      setStats({
        event,
        contestants,
        judges,
        criteria,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center py-10 px-2 sm:px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <AdminNav />
          <hr className="my-2" />
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" /> Admin Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading dashboard...</div>
          ) : (
            <>
              {stats.event && (
                <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary flex flex-col gap-1">
                  <div className="font-semibold text-primary flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> {stats.event.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Date: {new Date(stats.event.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} | Status: {stats.event.status}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <a href="/admin/contestants" className="flex flex-col items-center p-4 bg-background rounded-lg border hover:bg-primary/5 transition-colors cursor-pointer">
                  <Users className="w-6 h-6 mb-1 text-primary" />
                  <div className="text-2xl font-bold">{stats.contestants}</div>
                  <div className="text-xs text-muted-foreground">Contestants</div>
                </a>
                <a href="/admin/judges" className="flex flex-col items-center p-4 bg-background rounded-lg border hover:bg-primary/5 transition-colors cursor-pointer">
                  <UserCheck className="w-6 h-6 mb-1 text-primary" />
                  <div className="text-2xl font-bold">{stats.judges}</div>
                  <div className="text-xs text-muted-foreground">Judges</div>
                </a>
                <a href="/admin/criteria" className="flex flex-col items-center p-4 bg-background rounded-lg border hover:bg-primary/5 transition-colors cursor-pointer">
                  <ListChecks className="w-6 h-6 mb-1 text-primary" />
                  <div className="text-2xl font-bold">{stats.criteria}</div>
                  <div className="text-xs text-muted-foreground">Criteria</div>
                </a>
                <a href="/admin/events" className="flex flex-col items-center p-4 bg-background rounded-lg border hover:bg-primary/5 transition-colors cursor-pointer">
                  <Trophy className="w-6 h-6 mb-1 text-primary" />
                  <div className="text-2xl font-bold">{stats.event ? 1 : 0}</div>
                  <div className="text-xs text-muted-foreground">Active Events</div>
                </a>
              </div>
              <div className="text-center text-muted-foreground text-xs">
                Welcome! Use the navigation above to manage events, contestants, judges, criteria, and view results.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
