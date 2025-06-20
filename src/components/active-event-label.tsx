"use client";

import { useEffect, useState } from "react";

export function ActiveEventLabel({ refresh }: { refresh?: number }) {
  const [event, setEvent] = useState<{ id: number; name: string; date: string } | null>(null);

  useEffect(() => {
    // Try to get from localStorage first
    const updateFromLocalStorage = () => {
      const stored = typeof window !== "undefined" ? localStorage.getItem("activeEvent") : null;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.name && parsed.date) {
            setEvent(parsed);
            return;
          }
        } catch {}
      }
      // Fallback: fetch the active event from the API
      fetch("/api/admin/events/active")
        .then(res => res.json())
        .then(events => {
          if (Array.isArray(events) && events.length > 0) {
            setEvent({ id: events[0].id, name: events[0].name, date: events[0].date });
            localStorage.setItem("activeEvent", JSON.stringify({ id: events[0].id, name: events[0].name, date: events[0].date }));
          } else {
            setEvent(null);
            localStorage.removeItem("activeEvent");
          }
        });
    };
    updateFromLocalStorage();
    window.addEventListener("storage", updateFromLocalStorage);
    return () => window.removeEventListener("storage", updateFromLocalStorage);
  }, [refresh]);

  const formattedDate = event?.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mb-2 text-center">
      {event ? (
        <>
          <div className="text-lg font-bold text-primary leading-tight">{event.name}</div>
          {formattedDate && (
            <span className="text-sm text-muted-foreground font-normal mt-0.5">{formattedDate}</span>
          )}
        </>
      ) : (
        <span className="text-sm text-muted-foreground mb-2 text-center">No active event</span>
      )}
    </div>
  );
}
