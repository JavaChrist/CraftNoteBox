"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme-inline-script";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useLayoutEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const nextDark = !root.classList.contains("dark");
    if (nextDark) {
      root.classList.add("dark");
      localStorage.setItem(THEME_STORAGE_KEY, "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem(THEME_STORAGE_KEY, "light");
    }
    setDark(nextDark);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/60 text-foreground shadow-sm transition hover:bg-secondary"
      title={dark ? "Passer en mode clair" : "Passer en mode sombre"}
      aria-label={dark ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      {dark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
