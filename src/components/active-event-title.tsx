"use client";

import { useEffect } from "react";

export function ActiveEventTitle() {
  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/events/active")
      .then(res => res.json())
      .then(events => {
        if (!ignore && Array.isArray(events) && events.length > 0 && events[0].name) {
          // Do something with the event name if needed
        }
      });
    return () => {
      ignore = true;
    };
  }, []);
  return null;
}
