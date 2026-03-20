"use client";

import { useEffect } from "react";

export default function ThemeToggle() {
  useEffect(() => {
    // Always keep dark view (default).
    document.documentElement.classList.remove("theme-light");
    document.documentElement.classList.remove("theme");

    // Persist choice as dark so refreshes don't flip it back.
    try {
      localStorage.setItem("mq-theme", "dark");
    } catch {
      // ignore (e.g. privacy mode)
    }
  }, []);

  // No UI: design requirement is a single always-dark theme.
  return null;
}
