"use client";

import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import type { Meeting, PickablePage } from "@/lib/meetings/types";
import CreateMeetingDialog from "@/components/meetings/CreateMeetingDialog";
import MeetingsCalendar from "@/components/meetings/MeetingsCalendar";
import MeetingsList from "@/components/meetings/MeetingsList";

type Props = {
  meetings: Meeting[];
  pickablePages: PickablePage[];
  meetingsSchemaMissing?: boolean;
};

export default function MeetingsPage({
  meetings,
  pickablePages,
  meetingsSchemaMissing = false,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Meeting | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((m: Meeting) => {
    setEditing(m);
    setDialogOpen(true);
  }, []);

  const clearEditing = useCallback(() => {
    setEditing(null);
  }, []);

  return (
    <div className="mx-auto w-full max-w-none space-y-8">
      {meetingsSchemaMissing ? (
        <div
          className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm"
          role="status"
        >
          <p className="font-medium text-foreground">
            Base de données : module Réunions non installé
          </p>
          <p className="mt-1.5 text-muted-foreground">
            La table{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              public.meetings
            </code>{" "}
            est absente. Ouvre le{" "}
            <strong className="text-foreground">SQL Editor</strong> de Supabase
            et exécute le fichier{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              supabase/migrations/20260412000000_meetings.sql
            </code>
            . Ensuite recharge cette page.
          </p>
        </div>
      ) : null}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
            Réunions
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Calendrier & rendez-vous
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Planifie des réunions, associe des pages pour préparer le contenu, et
            retrouve tout dans une vue mois simple.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={meetingsSchemaMissing}
          title={
            meetingsSchemaMissing
              ? "Applique d’abord la migration SQL meetings sur Supabase"
              : undefined
          }
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nouveau rendez-vous
        </button>
      </header>

      <div className="flex flex-col gap-8">
        <MeetingsCalendar meetings={meetings} />
        <section aria-labelledby="meetings-list-heading">
          <h2
            id="meetings-list-heading"
            className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
          >
            Liste
          </h2>
          <MeetingsList meetings={meetings} onEdit={openEdit} />
        </section>
      </div>

      <CreateMeetingDialog
        open={dialogOpen && !meetingsSchemaMissing}
        onOpenChange={setDialogOpen}
        pickablePages={pickablePages}
        editing={editing}
        onEditingClear={clearEditing}
      />
    </div>
  );
}
