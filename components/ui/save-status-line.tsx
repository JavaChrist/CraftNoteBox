"use client";

import { AlertCircle, Check, Cloud, Loader2, PenLine } from "lucide-react";

type Props = {
  /** Contexte pour le libellé neutre initial */
  context: "editor" | "title";
  saving: boolean;
  dirty: boolean;
  lastSavedAt: Date | null;
  error: string | null;
};

/**
 * Ligne d’état : erreur → en cours → brouillon → enregistré → neutre.
 */
export function SaveStatusLine({
  context,
  saving,
  dirty,
  lastSavedAt,
  error,
}: Props) {
  if (error) {
    return (
      <div
        className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive"
        role="alert"
      >
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="leading-snug">{error}</span>
      </div>
    );
  }

  if (saving) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2
          className="h-3.5 w-3.5 shrink-0 animate-spin"
          aria-hidden
        />
        <span>Enregistrement en cours…</span>
      </div>
    );
  }

  if (dirty) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
        <PenLine className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>Modifications non enregistrées</span>
      </div>
    );
  }

  if (lastSavedAt) {
    const t = lastSavedAt.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Check
          className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-500"
          aria-hidden
        />
        <span>Enregistré à {t}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Cloud className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
      <span>
        {context === "editor"
          ? "Sauvegarde automatique"
          : "Sauvegarde automatique du titre"}
      </span>
    </div>
  );
}
