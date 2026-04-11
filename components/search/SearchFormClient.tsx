"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearSearchHistory,
  getSearchHistory,
  pushSearchHistory,
} from "@/lib/search-history";

type Props = {
  defaultQuery: string;
};

export default function SearchFormClient({ defaultQuery }: Props) {
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, [defaultQuery]);

  const refresh = () => setHistory(getSearchHistory());

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const q = String(fd.get("q") ?? "").trim();
          if (q) pushSearchHistory(q);
          refresh();
          router.push(`/search?q=${encodeURIComponent(q)}`);
        }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <label htmlFor="search-q" className="sr-only">
          Terme de recherche
        </label>
        <input
          id="search-q"
          name="q"
          type="search"
          key={defaultQuery}
          defaultValue={defaultQuery}
          placeholder="Mot-clé…"
          autoComplete="off"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Rechercher
        </button>
      </form>

      {defaultQuery.length === 0 && history.length > 0 ? (
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Recherches récentes
            </p>
            <button
              type="button"
              onClick={() => {
                clearSearchHistory();
                refresh();
              }}
              className="text-[10px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Effacer
            </button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {history.map((h) => (
              <li key={h}>
                <button
                  type="button"
                  onClick={() => {
                    pushSearchHistory(h);
                    refresh();
                    router.push(`/search?q=${encodeURIComponent(h)}`);
                  }}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground transition hover:bg-secondary"
                >
                  {h}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
