"use client";

import "../score-shake.css";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Contestant {
  id: number;
  number: number;
  name: string;
}

interface Criteria {
  id: number;
  name: string;
  subCriterias: SubCriteria[];
}

interface SubCriteria {
  id: number;
  name: string;
  weight: number;
  autoAssignToAllContestants: boolean;
}

export default function JudgeScorePage() {
  const params = useParams();
  const judgeId = params?.id;
  const [event, setEvent] = useState<{ id: number; name: string } | null>(null);
  const [judge, setJudge] = useState<{ id: number; name: string; number: number } | null>(null);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const eventRes = await fetch("/api/admin/events/active");
      const eventData = await eventRes.json();
      if (!eventData.length) return;
      setEvent(eventData[0]);
      const judgeRes = await fetch(`/api/admin/judges`);
      const judgeData = await judgeRes.json();
      setJudge(judgeData.find((j: { id: number }) => j.id.toString() === judgeId));
      const contestantsRes = await fetch(`/api/admin/contestants`);
      setContestants(await contestantsRes.json());
      const criteriaRes = await fetch(`/api/admin/criteria`);
      setCriteria(await criteriaRes.json());
      setLoading(false);
    }
    if (judgeId) fetchData();
  }, [judgeId]);

  // Fetch and prefill existing scores for this judge/event
  useEffect(() => {
    async function fetchScores() {
      if (!judgeId || !event?.id) return;
      const res = await fetch(`/api/score?judgeId=${judgeId}&eventId=${event.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        const prefill: Record<string, string> = {};
        data.forEach((s: { contestantId: number; criteriaId: number; value: number }) => {
          prefill[`${s.contestantId}_${s.criteriaId}`] = s.value.toString();
        });
        setScores(prev => ({ ...prefill, ...prev }));
      }
    }
    fetchScores();
    // Only run when judgeId or event changes
  }, [judgeId, event?.id]);

  // Auto set value for auto sub-criteria
  useEffect(() => {
    // Only run after contestants and criteria are loaded
    if (contestants.length && criteria.length) {
      const autoScores: Record<string, string> = {};
      criteria.forEach(main => {
        main.subCriterias.forEach(sub => {
          if (sub.autoAssignToAllContestants) {
            contestants.forEach(contestant => {
              // For now, set to sub.weight as a default (can be changed as needed)
              autoScores[`${contestant.id}_${sub.id}`] = sub.weight.toString();
            });
          }
        });
      });
      setScores(prev => ({ ...autoScores, ...prev }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestants, criteria]);

  // Local storage key for autosave
  const localStorageKey = event && judge ? `score-autosave-event-${event.id}-judge-${judge.id}` : null;

  // Load autosaved scores from localStorage on mount or when event/judge changes
  useEffect(() => {
    if (!localStorageKey) return;
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setScores(prev => ({ ...prev, ...parsed }));
        }
      } catch {}
    }
  }, [localStorageKey]);

  // Autosave scores to localStorage whenever they change
  useEffect(() => {
    if (!localStorageKey) return;
    localStorage.setItem(localStorageKey, JSON.stringify(scores));
  }, [scores, localStorageKey]);

  // Clear autosave on successful submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: { contestantId: number; subCriteriaId: number; value: number }[] = [];
    mainGroups.forEach(main => {
      main.subCriterias.forEach(sub => {
        contestants.forEach(contestant => {
          // Only include scores for visible contestants and sub-criteria
          const val = scores[`${contestant.id}_${sub.id}`];
          if (val !== undefined && val !== "") {
            payload.push({
              contestantId: contestant.id,
              subCriteriaId: sub.id,
              value: parseFloat(val),
            });
          }
        });
      });
    });
    // Only send the current payload (visible/active scores)
    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        judgeId,
        eventId: event?.id,
        scores: payload,
      }),
    });
    if (res.ok) {
      if (localStorageKey) localStorage.removeItem(localStorageKey);
      toast.success("Scores submitted!");
    } else {
      toast.error("Failed to submit scores");
    }
  };

  // Remove unused allSubCriterias and fix variable scoping
  // mainGroups and contestants are defined in the render scope
  // Move mainGroups definition inside the render function
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!event || !judge) return <div className="min-h-screen flex items-center justify-center">Event or Judge not found.</div>;

  // Group sub-criteria by main criteria for table columns
  const mainGroups = criteria.map(main => ({
    id: main.id,
    name: main.name,
    totalWeight: main.subCriterias.reduce((sum, s) => sum + (s.weight || 0), 0),
    subCriterias: main.subCriterias,
  }));

  // Add back handleScoreChange for input fields
  const handleScoreChange = (contestantId: number, subCriteriaId: number, value: string) => {
    setScores(prev => ({ ...prev, [`${contestantId}_${subCriteriaId}`]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-7xl mx-auto p-4 sm:p-8 flex flex-col gap-8 shadow-xl overflow-x-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-2">
          {event.name}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <table className="min-w-full border-separate" style={{ borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="border-b-2 border-muted p-2 text-center align-bottom" rowSpan={2}>Contestant #</th>
                {mainGroups.map((main, mainIdx) => (
                  <th
                    key={main.id}
                    colSpan={main.subCriterias.length}
                    className={[
                      "border-b-2 border-muted p-2 text-center align-bottom",
                      mainIdx === 0 ? "border-l-2 border-muted" : "",
                      mainIdx === mainGroups.length - 1 ? "border-r-2 border-muted" : "",
                      mainIdx !== 0 ? "border-l-2 border-muted" : ""
                    ].join(" ")}
                  >
                    <div className="font-semibold">{main.name}</div>
                    <div className="text-xs text-muted-foreground">({main.totalWeight}%)</div>
                  </th>
                ))}
                <th className="border-b-2 border-l-2 border-muted p-2 text-center align-bottom" rowSpan={2}>Total Score</th>
              </tr>
              <tr>
                {mainGroups.map((main, mainIdx) => (
                  main.subCriterias.map((sub, subIdx) => (
                    <th
                      key={sub.id}
                      className={[
                        "border-b-2 border-muted p-2 text-center font-normal",
                        (mainIdx === 0 && subIdx === 0) ? "border-l-2 border-muted" : "",
                        (mainIdx === mainGroups.length - 1 && subIdx === main.subCriterias.length - 1) ? "border-r-2 border-muted" : "",
                        mainIdx !== 0 && subIdx === 0 ? "border-l-2 border-muted" : ""
                      ].join(" ")}
                    >
                      {sub.name}<br />
                      <span className="text-xs text-muted-foreground">({sub.weight}%)</span>
                      {sub.autoAssignToAllContestants && <span className="text-xs text-primary"> (Auto)</span>}
                    </th>
                  ))
                ))}
              </tr>
            </thead>
            <tbody>
              {contestants.map(contestant => {
                // Calculate total score for this contestant (simple sum)
                let total = 0;
                mainGroups.forEach(main => {
                  main.subCriterias.forEach(sub => {
                    const val = parseFloat(scores[`${contestant.id}_${sub.id}`] || "0");
                    total += isNaN(val) ? 0 : val;
                  });
                });
                return (
                  <tr key={contestant.id}>
                    <td className="border-b-2 border-muted p-1 font-mono whitespace-nowrap text-xs text-center">#{contestant.number}</td>
                    {mainGroups.map((main, mainIdx) => (
                      main.subCriterias.map((sub, subIdx) => (
                        <td
                          key={sub.id}
                          className={[
                            "border-b-2 border-muted p-1 text-center",
                            (mainIdx === 0 && subIdx === 0) ? "border-l-2 border-muted" : "",
                            (mainIdx === mainGroups.length - 1 && subIdx === main.subCriterias.length - 1) ? "border-r-2 border-muted" : "",
                            mainIdx !== 0 && subIdx === 0 ? "border-l-2 border-muted" : ""
                          ].join(" ")}
                        >
                          <Input
                            type="number"
                            min={0}
                            max={sub.weight}
                            step={0.01}
                            className="w-full h-8 px-1 py-0 text-xs text-center"
                            value={scores[`${contestant.id}_${sub.id}`] || ""}
                            onChange={e => {
                              const v = e.target.value;
                              if (v && parseFloat(v) > sub.weight) {
                                handleScoreChange(contestant.id, sub.id, "");
                                e.target.classList.add("animate-shake");
                                setTimeout(() => {
                                  e.target.classList.remove("animate-shake");
                                }, 1200);
                                return;
                              }
                              handleScoreChange(contestant.id, sub.id, v);
                            }}
                            required={!sub.autoAssignToAllContestants}
                            disabled={sub.autoAssignToAllContestants}
                          />
                        </td>
                      ))
                    ))}
                    <td className="border-b-2 border-l-2 border-muted p-1 text-center font-bold text-xs">{total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Button type="submit" className="self-end">Submit Scores</Button>
        </form>
      </Card>
    </div>
  );
}
