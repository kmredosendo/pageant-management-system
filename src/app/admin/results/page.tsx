"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { ActiveEventLabel } from "@/components/active-event-label";

export default function AdminResultsPage() {
  return (
    <div className="min-h-screen bg-muted flex flex-col items-center py-10 px-2 sm:px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-col gap-2 items-stretch">
          <AdminNav />
          <ActiveEventLabel />
          <hr className="my-2" />
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" /> Results
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Link href="/results/best-in-talent" className="w-full">
            <div className="bg-background rounded-md p-4 shadow hover:bg-accent transition flex flex-col items-center">
              <span className="font-semibold text-lg">Best in Talent</span>
            </div>
          </Link>
          <Link href="/results/best-in-interview" className="w-full">
            <div className="bg-background rounded-md p-4 shadow hover:bg-accent transition flex flex-col items-center">
              <span className="font-semibold text-lg">Best in Interview</span>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
