"use client";

import { FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import SidebarModal from "@/components/layout/SidebarModal";
import { createSection } from "@/lib/actions/sections";

export default function SidebarCreateSectionButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = useCallback(() => {
    setOpen(false);
    setTitle("");
    setError(null);
  }, []);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      try {
        await createSection({ title });
        close();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Création impossible");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-11 w-full touch-manipulation items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      >
        <FolderPlus className="h-4 w-4 shrink-0" aria-hidden />
        Nouvelle rubrique
      </button>
      {open ? (
        <SidebarModal title="Nouvelle rubrique" onClose={close}>
          <label htmlFor="sidebar-new-section-title" className="sr-only">
            Nom de la rubrique
          </label>
          <input
            id="sidebar-new-section-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Nom de la rubrique"
            maxLength={40}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            autoFocus
            disabled={pending}
            autoComplete="off"
          />
          {error ? (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={close}
              className="rounded-md border border-border px-3 py-1.5 text-xs transition hover:bg-secondary"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={submit}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Création…" : "Créer"}
            </button>
          </div>
        </SidebarModal>
      ) : null}
    </>
  );
}
