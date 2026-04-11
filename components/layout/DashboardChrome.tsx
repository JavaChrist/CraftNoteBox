"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SearchCommandPalette from "@/components/layout/SearchCommandPalette";

type Props = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export default function DashboardChrome({ sidebar, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="flex min-h-[100dvh] w-full">
      <SearchCommandPalette />
      <div
        className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-72 max-w-[85vw] flex-col bg-card/50 pt-[env(safe-area-inset-top,0px)] shadow-xl transition-transform duration-200 ease-out md:static md:z-0 md:h-auto md:max-w-none md:translate-x-0 md:pt-0 md:shadow-none md:bg-transparent ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        id="dashboard-sidebar-panel"
      >
        {sidebar}
      </div>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
          aria-label="Fermer le menu"
          onClick={close}
        />
      ) : null}

      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-background/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
          <div className="flex h-12 items-center gap-2 px-2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-secondary/50 text-foreground touch-manipulation transition hover:bg-secondary"
              aria-expanded={open}
              aria-controls="dashboard-sidebar-panel"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {open ? (
                <X className="h-5 w-5 shrink-0" aria-hidden />
              ) : (
                <Menu className="h-5 w-5 shrink-0" aria-hidden />
              )}
            </button>
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Navigation
            </span>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto pb-[env(safe-area-inset-bottom,0px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
