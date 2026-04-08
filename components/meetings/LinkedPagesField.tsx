"use client";

import { useMemo, useState } from "react";
import type { PickablePage } from "@/lib/meetings/types";

type Props = {
  pages: PickablePage[];
  value: string[];
  onChange: (pageIds: string[]) => void;
  disabled?: boolean;
};

export default function LinkedPagesField({
  pages,
  value,
  onChange,
  disabled,
}: Props) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.scope.toLowerCase().includes(q),
    );
  }, [pages, filter]);

  const set = useMemo(() => new Set(value), [value]);

  const toggle = (id: string) => {
    if (disabled) return;
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-medium text-foreground">
        Pages liées
      </legend>
      <p className="text-xs text-muted-foreground">
        Pages optionnelles liées au rendez-vous.
      </p>
      {pages.length > 8 ? (
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrer par titre…"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          aria-label="Filtrer les pages"
        />
      ) : null}
      <div className="max-h-44 space-y-1 overflow-y-auto rounded-md border border-border bg-muted/20 p-2">
        {filtered.length === 0 ? (
          <p className="px-1 py-2 text-xs text-muted-foreground">
            {pages.length === 0
              ? "Aucune page — crée-en une dans la barre latérale."
              : "Aucun résultat."}
          </p>
        ) : (
          filtered.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition hover:bg-secondary/80"
            >
              <input
                type="checkbox"
                className="rounded border-border"
                checked={set.has(p.id)}
                onChange={() => toggle(p.id)}
              />
              <span className="min-w-0 flex-1 truncate">{p.title}</span>
              <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                {p.scope === "pro" ? "PRO" : "privé"}
              </span>
            </label>
          ))
        )}
      </div>
    </fieldset>
  );
}
