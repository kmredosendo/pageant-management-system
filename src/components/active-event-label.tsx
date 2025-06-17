"use client";

import { useEffect, useState } from "react";

export function ActiveEventLabel() {
  const [eventTitle, setEventTitle] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch from localStorage (except on admin/page.tsx and app/page.tsx)
    const storedTitle = typeof window !== "undefined" ? localStorage.getItem("activeEventTitle") : null;
    const storedDate = typeof window !== "undefined" ? localStorage.getItem("activeEventDate") : null;
    setEventTitle(storedTitle);
    setEventDate(storedDate);
  }, []);

  if (!eventTitle) return (
    <div className="text-sm text-muted-foreground mb-2 text-center">No active event</div>
  );

  const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : null;

  return (
    <div className="mb-2 text-center">
      <div className="text-lg font-bold text-primary leading-tight">{eventTitle}</div>
      {formattedDate && <div className="text-sm text-muted-foreground font-normal mt-0.5">{formattedDate}</div>}
    </div>
  );
}
