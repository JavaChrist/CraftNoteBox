"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import isHotkey from "is-hotkey";
import SidebarModal from "@/components/layout/SidebarModal";
import { getSearchHistory, pushSearchHistory } from "@/lib/search-history";

export default function SearchCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const refreshHistory = useCallback(() => {
    setHistory(getSearchHistory());
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
  }, []);

  const goSearch = useCallback(
    (raw: string) => {
      const term = raw.trim();
      if (!term) return;
      pushSearchHistory(term);
      close();
      router.push(`/search?q=${encodeURIComponent(term)}`);
    },
    [router, close],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        (t instanceof HTMLElement && t.isContentEditable)
      ) {
        return;
      }
      if (isHotkey("mod+k", e)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      refreshHistory();
      queueMicrotask(() => inputRef.current?.focus());
    }
  }, [open, refreshHistory]);

  if (!open) return null;

  return (
    <SidebarModal title="Rechercher" onClose={close}>
      <p className="mb-2 text-xs text-muted-foreground">
        Raccourci : <kbd className="rounded border border-border bg-muted px-1 py-px font-mono text-[10px]">Ctrl</kbd>{" "}
        +{" "}
        <kbd className="rounded border border-border bg-muted px-1 py-px font-mono text-[10px]">K</kbd>{" "}
        ({" "}
        <kbd className="rounded border border-border bg-muted px-1 py-px font-mono text-[10px]">⌘</kbd>{" "}
        +{" "}
        <kbd className="rounded border border-border bg-muted px-1 py-px font-mono text-[10px]">K</kbd>{" "}
        sur Mac)
      </p>
      <label htmlFor="search-palette-q" className="sr-only">
        Terme de recherche
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={inputRef}
          id="search-palette-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              goSearch(q);
            }
          }}
          placeholder="Mot-clé…"
          className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm"
          autoComplete="off"
        />
      </div>
      {history.length > 0 ? (
        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Récentes
          </p>
          <ul className="max-h-36 space-y-1 overflow-y-auto">
            {history.map((h) => (
              <li key={h}>
                <button
                  type="button"
                  onClick={() => goSearch(h)}
                  className="w-full truncate rounded-md px-2 py-1.5 text-left text-xs text-foreground transition hover:bg-secondary"
                >
                  {h}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={close}
          className="rounded-md border border-border px-3 py-1.5 text-xs transition hover:bg-secondary"
        >
          Fermer
        </button>
        <button
          type="button"
          onClick={() => goSearch(q)}
          disabled={!q.trim()}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
        >
          Rechercher
        </button>
      </div>
    </SidebarModal>
  );
}
