"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { createPage } from "@/lib/actions/pages";
import SidebarModal from "@/components/layout/SidebarModal";
import type { PageScope } from "@/lib/db/types";

type Props = {
  scope: PageScope;
  variant: "private" | "pro";
};

export default function SidebarCreatePageButton({ scope, variant }: Props) {
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
    const t = title.trim();
    if (!t) {
      setError("Indique un titre pour la page.");
      return;
    }
    startTransition(async () => {
      try {
        const page = await createPage({ title: t, scope });
        close();
        router.push(`/pages/${page.id}`);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Création impossible");
      }
    });
  };

  const plusTitle =
    variant === "pro" ? "Nouvelle page PRO" : "Nouvelle page";
  const ariaLabel =
    variant === "pro"
      ? "Créer une nouvelle page PRO"
      : "Créer une nouvelle page privée";
  const dialogTitle =
    variant === "pro" ? "Nouvelle page PRO" : "Nouvelle page privée";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        title={plusTitle}
        aria-label={ariaLabel}
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <SidebarModal title={dialogTitle} onClose={close}>
          <label htmlFor="sidebar-new-page-title" className="sr-only">
            Titre de la page
          </label>
          <input
            id="sidebar-new-page-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Titre de la page"
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
