"use client";

import { RawScoresTable } from "@/components/RawScoresTable";

export default function PrintRawScoresPage({ params }: { params: { judgeId: string } }) {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <RawScoresTable judgeId={parseInt(params.judgeId, 10)} tableClassName="min-w-full text-xs border" />
    </div>
  );
}
