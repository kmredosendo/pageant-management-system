"use client";



import { RawScoresTable } from "@/components/RawScoresTable";
import { PrintHeader } from "@/components/print-header";
import { PrintFooter } from "@/components/print-footer";
import * as React from "react";

export default function PrintRawScoresPage({ params }: { params: Promise<{ judgeId: string }> }) {
  const { judgeId } = React.use(params);
  const [event, setEvent] = React.useState<{
    name: string;
    date: string;
    institutionName?: string;
    institutionAddress?: string;
    venue?: string;
  } | null>(null);
  const [judge, setJudge] = React.useState<{ name: string, number: string } | null>(null);

  React.useEffect(() => {
    fetch("/api/admin/events/active")
      .then(res => res.json())
      .then(events => {
        if (Array.isArray(events) && events.length > 0) {
          setEvent({
            name: events[0].name,
            date: events[0].date,
            institutionName: events[0].institutionName,
            institutionAddress: events[0].institutionAddress,
            venue: events[0].venue,
          });
        } else {
          setEvent(null);
        }
      });
    fetch(`/api/admin/judges/${judgeId}`)
      .then(res => res.json())
      .then(judge => {
        if (judge && judge.name && judge.number !== undefined) {
          setJudge({ name: judge.name, number: String(judge.number) });
        } else {
          setJudge(null);
        }
      });
  }, [judgeId]);

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <PrintHeader event={event} />
      <RawScoresTable judgeId={parseInt(judgeId, 10)} tableClassName="min-w-full text-xs border" />
      {judge && <PrintFooter judgeName={judge.name} judgeNumber={judge.number} />}
    </div>
  );
}
