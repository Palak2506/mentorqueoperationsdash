"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mq-theme");
    const light = saved === "light";
    setIsLight(light);
    document.documentElement.classList.toggle("theme-light", light);
  }, []);

  function toggleTheme() {
    const next = !isLight;
    setIsLight(next);
    localStorage.setItem("mq-theme", next ? "light" : "dark");
    document.documentElement.classList.toggle("theme-light", next);
  }

  return (
    <button
      onClick={toggleTheme}
      className="rounded-md border border-white/25 px-2.5 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:bg-white/10"
      title="Switch day/night view"
    >
      {isLight ? "Night view" : "Day view"}
    </button>
  );
}
