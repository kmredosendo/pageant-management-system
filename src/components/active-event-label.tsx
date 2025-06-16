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

  return (
    <div className="text-base text-primary font-semibold mb-2 text-center">
      Active Event: {activeEvent.name} ({new Date(activeEvent.date).toLocaleDateString()})
    </div>
  );
}
