"use client";

import { useEffect, useMemo, useState } from "react";
import { createAutosave } from "@/lib/utils/autosave";
import { SaveStatusLine } from "@/components/ui/save-status-line";

type Props = {
  initialTitle: string;
  saveTitle: (title: string) => Promise<void>;
};

export default function PageTitleField({ initialTitle, saveTitle }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    setTitle(initialTitle);
    setDirty(false);
    setError(null);
  }, [initialTitle]);

  const debouncedSave = useMemo(
    () =>
      createAutosave(async (raw: string) => {
        const next = raw.trim() || "Sans titre";
        setSaving(true);
        try {
          await saveTitle(next);
          setDirty(false);
          setLastSavedAt(new Date());
          setError(null);
        } catch (err) {
          const msg =
            err instanceof Error
              ? err.message
              : "Échec de l’enregistrement du titre";
          setError(msg);
        } finally {
          setSaving(false);
        }
      }, 600),
    [saveTitle],
  );

  return (
    <div className="space-y-1">
      <input
        type="text"
        value={title}
        onChange={(e) => {
          const v = e.target.value;
          setTitle(v);
          setDirty(true);
          debouncedSave(v);
        }}
        onBlur={() => {
          if ("flush" in debouncedSave) {
            (debouncedSave as { flush: () => void }).flush();
          }
        }}
        className="w-full border-0 bg-transparent p-0 text-2xl font-semibold tracking-tight text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
        placeholder="Sans titre"
        aria-label="Titre de la page"
        autoComplete="off"
      />
      <div className="min-h-[2.25rem]">
        <SaveStatusLine
          context="title"
          saving={saving}
          dirty={dirty}
          lastSavedAt={lastSavedAt}
          error={error}
        />
      </div>
    </div>
  );
}
