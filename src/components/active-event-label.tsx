"use client";

import { useEffect, useState } from "react";

export function ActiveEventLabel({ refresh }: { refresh?: number }) {
  const [eventTitle, setEventTitle] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState<string | null>(null);

  useEffect(() => {
    // Try to get from localStorage first
    const storedTitle = typeof window !== "undefined" ? localStorage.getItem("activeEventTitle") : null;
    const storedDate = typeof window !== "undefined" ? localStorage.getItem("activeEventDate") : null;
    if (storedTitle && storedDate) {
      setEventTitle(storedTitle);
      setEventDate(storedDate);
    } else {
      // Fallback: fetch the active event from the API
      fetch("/api/admin/events/active")
        .then(res => res.json())
        .then(events => {
          if (Array.isArray(events) && events.length > 0) {
            setEventTitle(events[0].name);
            setEventDate(events[0].date);
            localStorage.setItem("activeEventTitle", events[0].name);
            localStorage.setItem("activeEventDate", events[0].date);
          } else {
            setEventTitle(null);
            setEventDate(null);
            localStorage.removeItem("activeEventTitle");
            localStorage.removeItem("activeEventDate");
          }
        });
    }
  }, [refresh]);

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mb-2 text-center">
      {eventTitle ? (
        <>
          <div className="text-lg font-bold text-primary leading-tight">{eventTitle}</div>
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
