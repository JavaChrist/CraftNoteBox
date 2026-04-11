"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { permanentDeletePage, restorePage } from "@/lib/actions/pages";
import type { Page } from "@/lib/db/types";

type Props = {
  initialPages: Page[];
};

export default function TrashPageClient({ initialPages }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onRestore = (id: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await restorePage(id);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Restauration impossible");
      }
    });
  };

  const onDestroy = (id: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await permanentDeletePage(id);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Suppression impossible");
      }
    });
  };

  if (initialPages.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/15 px-4 py-8 text-center text-sm text-muted-foreground">
        La corbeille est vide.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="space-y-2">
        {initialPages.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-foreground">
                {p.title || "Sans titre"}
              </p>
              <p className="text-xs text-muted-foreground">
                {p.scope === "pro" ? "PRO" : "Privé"}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => onRestore(p.id)}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                Restaurer
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => onDestroy(p.id)}
                className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/20 disabled:opacity-50"
              >
                Supprimer définitivement
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
