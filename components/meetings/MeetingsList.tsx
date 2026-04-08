"use client";

import { CalendarX } from "lucide-react";
import type { Meeting } from "@/lib/meetings/types";
import MeetingCard from "@/components/meetings/MeetingCard";

type Props = {
  meetings: Meeting[];
  onEdit: (m: Meeting) => void;
};

export default function MeetingsList({ meetings, onEdit }: Props) {
  const now = Date.now();
  const upcoming = meetings.filter((m) => new Date(m.endAt).getTime() >= now);
  const past = meetings.filter((m) => new Date(m.endAt).getTime() < now);

  if (meetings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/15 px-6 py-12 text-center">
        <CalendarX
          className="mx-auto h-10 w-10 text-muted-foreground"
          aria-hidden
        />
        <p className="mt-3 text-sm font-medium text-foreground">
          Aucun rendez-vous pour cette période
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Utilise le bouton{" "}
          <span className="font-medium text-foreground">Nouveau rendez-vous</span>{" "}
          pour planifier une réunion et lier des pages existantes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {upcoming.length > 0 ? (
        <section aria-labelledby="meetings-upcoming">
          <h2
            id="meetings-upcoming"
            className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
          >
            À venir ({upcoming.length})
          </h2>
          <ul className="space-y-3">
            {upcoming.map((m) => (
              <li key={m.id}>
                <MeetingCard meeting={m} onEdit={onEdit} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {past.length > 0 ? (
        <section aria-labelledby="meetings-past">
          <h2
            id="meetings-past"
            className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
          >
            Passés ({past.length})
          </h2>
          <ul className="space-y-3 opacity-90">
            {past.map((m) => (
              <li key={m.id}>
                <MeetingCard meeting={m} onEdit={onEdit} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
