"use client";

import { useEffect } from "react";

export function ActiveEventTitle() {
  useEffect(() => {
    const originalTitle = document.title;
    let ignore = false;
    fetch("/api/admin/events/active")
      .then(res => res.json())
      .then(events => {
        if (!ignore && Array.isArray(events) && events.length > 0 && events[0].name) {
          document.title = events[0].name;
        }
      });
    return () => {
      ignore = true;
      document.title = originalTitle;
    };
  }, []);
  return null;
}
