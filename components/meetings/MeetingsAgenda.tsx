"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Meeting } from "@/lib/meetings/types";

type Props = {
  meetings: Meeting[];
  year: number;
  monthIndex: number;
};

function formatSlot(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "—";
  const day = s.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const t1 = s.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const t2 = e.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} · ${t1} – ${t2}`;
}

export default function MeetingsAgenda({
  meetings,
  year,
  monthIndex,
}: Props) {
  const rows = useMemo(() => {
    return meetings
      .filter((m) => {
        const d = new Date(m.startAt);
        if (Number.isNaN(d.getTime())) return false;
        return d.getFullYear() === year && d.getMonth() === monthIndex;
      })
      .sort(
        (a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
  }, [meetings, year, monthIndex]);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
        Aucun rendez-vous sur ce mois en vue agenda.
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {rows.map((m) => (
        <li key={m.id}>
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-card/50 px-3 py-2.5 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {formatSlot(m.startAt, m.endAt)}
              </p>
              <p className="font-medium text-foreground">{m.title}</p>
            </div>
            {m.minutesPageId ? (
              <Link
                href={`/pages/${m.minutesPageId}`}
                className="shrink-0 text-xs font-medium text-primary underline-offset-2 hover:underline"
              >
                Compte rendu
              </Link>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
