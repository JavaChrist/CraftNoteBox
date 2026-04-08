"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ExternalLink, FileText, MapPin, Pencil, Trash2 } from "lucide-react";
import { deleteMeeting } from "@/lib/actions/meetings";
import type { Meeting } from "@/lib/meetings/types";

function formatRange(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "—";
  const dateStr = s.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const t1 = s.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const t2 = e.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} · ${t1} – ${t2}`;
}

function snippet(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

type Props = {
  meeting: Meeting;
  onEdit: (m: Meeting) => void;
};

export default function MeetingCard({ meeting, onEdit }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = () => {
    setDeleteError(null);
    startTransition(async () => {
      try {
        await deleteMeeting(meeting.id);
        setConfirmDelete(false);
        router.refresh();
      } catch (err) {
        setDeleteError(
          err instanceof Error ? err.message : "Suppression impossible",
        );
      }
    });
  };

  return (
    <article className="rounded-lg border border-border bg-card/50 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-foreground">{meeting.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatRange(meeting.startAt, meeting.endAt)}
          </p>
          {meeting.location ? (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">{meeting.location}</span>
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(meeting)}
            disabled={pending}
            className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-50"
            title="Modifier"
            aria-label={`Modifier « ${meeting.title} »`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setConfirmDelete(true);
            }}
            disabled={pending}
            className="rounded-md p-2 text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive disabled:opacity-50"
            title="Supprimer"
            aria-label={`Supprimer « ${meeting.title} »`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {meeting.description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {snippet(meeting.description, 220)}
        </p>
      ) : null}

      {meeting.minutesPageId ? (
        <div className="mt-3">
          <Link
            href={`/pages/${meeting.minutesPageId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <FileText className="h-4 w-4 shrink-0" aria-hidden />
            Ouvrir le compte rendu
          </Link>
        </div>
      ) : null}

      {(() => {
        const extraLinked = meeting.minutesPageId
          ? meeting.linkedPages.filter((p) => p.id !== meeting.minutesPageId)
          : meeting.linkedPages;
        return extraLinked.length > 0 ? (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {meeting.minutesPageId ? "Autres pages liées" : "Pages liées"}
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-2">
            {extraLinked.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/pages/${p.id}`}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/40 px-2 py-1 text-xs font-medium text-foreground transition hover:bg-secondary"
                >
                  <span className="max-w-[10rem] truncate">{p.title}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {p.scope === "pro" ? "PRO" : "privé"}
                  </span>
                  <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        ) : null;
      })()}

      {confirmDelete ? (
        <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3">
          <p className="text-sm text-foreground">
            Supprimer ce rendez-vous ?
          </p>
          {deleteError ? (
            <p className="mt-2 text-xs text-destructive">{deleteError}</p>
          ) : null}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmDelete(false)}
              className="rounded-md border border-border px-3 py-1.5 text-xs"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleDelete}
              className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground"
            >
              {pending ? "…" : "Supprimer"}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
