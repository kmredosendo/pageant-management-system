"use client";

import { useEffect, useState } from "react";

export function ActiveEventLabel() {
  const [activeEvent, setActiveEvent] = useState<{ name: string; date: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/events/active")
      .then(res => res.json())
      .then(events => {
        if (Array.isArray(events) && events.length > 0) {
          setActiveEvent(events[0]);
        } else {
          setActiveEvent(null);
        }
      });
  }, []);

  if (!activeEvent) return (
    <div className="text-sm text-muted-foreground mb-2 text-center">No active event</div>
  );

  const formattedDate = new Date(activeEvent.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mb-2 text-center">
      <div className="text-lg font-bold text-primary leading-tight">{activeEvent.name}</div>
      <div className="text-sm text-muted-foreground font-normal mt-0.5">{formattedDate}</div>
    </div>
  );
}
