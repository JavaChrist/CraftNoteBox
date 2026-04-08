"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Meeting } from "@/lib/meetings/types";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

/** Lundi = 0 … Dimanche = 6 */
function mondayBasedWeekday(date: Date) {
  const js = date.getDay();
  return js === 0 ? 6 : js - 1;
}

function ymdKey(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

/** Jour local (calendrier) du début du rendez-vous. */
function meetingLocalDayKey(iso: string): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "";
  return ymdKey(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

type Props = {
  meetings: Meeting[];
};

export default function MeetingsCalendar({ meetings }: Props) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const byDay = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const m of meetings) {
      const key = meetingLocalDayKey(m.startAt);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    for (const arr of map.values()) {
      arr.sort(
        (a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
    }
    return map;
  }, [meetings]);

  const { year, monthIndex, monthLabel, cells } = useMemo(() => {
    const year = cursor.getFullYear();
    const monthIndex = cursor.getMonth();
    const monthLabel = cursor.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
    const first = new Date(year, monthIndex, 1);
    const startPad = mondayBasedWeekday(first);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;
    const cells: ({ day: number } | null)[] = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startPad + 1;
      if (dayNum < 1 || dayNum > daysInMonth) cells.push(null);
      else cells.push({ day: dayNum });
    }
    return { year, monthIndex, monthLabel, cells };
  }, [cursor]);

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    cursor.getMonth() === today.getMonth() &&
    cursor.getFullYear() === today.getFullYear();

  const countForMonth = useMemo(() => {
    let n = 0;
    for (const m of meetings) {
      const d = new Date(m.startAt);
      if (
        !Number.isNaN(d.getTime()) &&
        d.getFullYear() === year &&
        d.getMonth() === monthIndex
      ) {
        n++;
      }
    }
    return n;
  }, [meetings, year, monthIndex]);

  return (
    <div className="w-full rounded-xl border border-border bg-card/40 p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold capitalize text-foreground">
            {monthLabel}
          </h2>
          <p className="text-xs text-muted-foreground">
            {countForMonth === 0
              ? "Aucun rendez-vous ce mois-ci"
              : `${countForMonth} rendez-vous ce mois-ci`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCursor((c) => addMonths(c, -1))}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCursor(startOfMonth(new Date()))}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            Aujourd’hui
          </button>
          <button
            type="button"
            onClick={() => setCursor((c) => addMonths(c, 1))}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Mois suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px rounded-lg bg-border text-center text-[11px] font-medium text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="bg-card py-2">
            {d}
          </div>
        ))}
        {cells.map((cell, i) => {
          const dayMeetings =
            cell != null
              ? byDay.get(ymdKey(year, monthIndex, cell.day)) ?? []
              : [];
          const dot =
            dayMeetings.length > 0 ? (
              <span
                className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-primary"
                title={`${dayMeetings.length} rendez-vous`}
                aria-hidden
              />
            ) : null;

          return (
            <div
              key={`${year}-${monthIndex}-${i}`}
              className="min-h-[4.25rem] bg-background p-1 text-left align-top"
            >
              {cell ? (
                <div
                  className={`flex h-full min-h-[3.75rem] flex-col rounded-md px-0.5 py-0.5 ${
                    isToday(cell.day)
                      ? "bg-primary/15 ring-1 ring-primary/40"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <div
                    className={`flex shrink-0 items-center justify-center gap-1 text-sm ${
                      isToday(cell.day)
                        ? "font-semibold text-primary"
                        : "text-foreground"
                    }`}
                  >
                    <span>{cell.day}</span>
                    {dot}
                  </div>
                  <ul className="mt-0.5 min-h-0 flex-1 space-y-0.5 overflow-hidden">
                    {dayMeetings.slice(0, 3).map((m) => (
                      <li
                        key={m.id}
                        className="truncate rounded bg-secondary/60 px-1 py-px text-[10px] leading-tight text-foreground"
                        title={m.title}
                      >
                        {m.title}
                      </li>
                    ))}
                    {dayMeetings.length > 3 ? (
                      <li className="px-1 text-[10px] text-muted-foreground">
                        +{dayMeetings.length - 3}
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : (
                <div className="h-full min-h-[3.75rem]" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
