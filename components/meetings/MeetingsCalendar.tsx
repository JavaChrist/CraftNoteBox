"use client";

import { useMemo } from "react";
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
  /** Clic sur un rendez-vous dans une case (ouvre le même dialogue que « Modifier »). */
  onMeetingClick: (meeting: Meeting) => void;
  /** Premier jour du mois affiché (contrôlé par le parent pour l’agenda). */
  month: Date;
  onMonthChange: (nextMonthStart: Date) => void;
};

export default function MeetingsCalendar({
  meetings,
  onMeetingClick,
  month: cursor,
  onMonthChange,
}: Props) {

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
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card/50 shadow-sm">
      <div className="border-b border-border/80 bg-gradient-to-br from-primary/[0.06] to-transparent px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold capitalize tracking-tight text-foreground sm:text-xl">
              {monthLabel}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              {countForMonth === 0
                ? "Aucun rendez-vous ce mois-ci"
                : `${countForMonth} rendez-vous ce mois-ci`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 self-start sm:self-center">
            <button
              type="button"
              onClick={() => onMonthChange(addMonths(cursor, -1))}
              className="rounded-lg border border-transparent p-2 text-muted-foreground transition hover:border-border hover:bg-secondary hover:text-foreground touch-manipulation"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onMonthChange(startOfMonth(new Date()))}
              className="rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-secondary touch-manipulation"
            >
              Aujourd’hui
            </button>
            <button
              type="button"
              onClick={() => onMonthChange(addMonths(cursor, 1))}
              className="rounded-lg border border-transparent p-2 text-muted-foreground transition hover:border-border hover:bg-secondary hover:text-foreground touch-manipulation"
              aria-label="Mois suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-3">
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-border/60">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="bg-muted/40 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[11px]"
            >
              {d}
            </div>
          ))}
          {cells.map((cell, i) => {
            const dayMeetings =
              cell != null
                ? byDay.get(ymdKey(year, monthIndex, cell.day)) ?? []
                : [];

            return (
              <div
                key={`${year}-${monthIndex}-${i}`}
                className="min-h-[5rem] bg-background p-1 text-left align-top sm:min-h-[5.5rem]"
              >
                {cell ? (
                  <div
                    className={`flex h-full min-h-[4.5rem] flex-col rounded-lg px-0.5 py-1 sm:min-h-[5rem] ${
                      isToday(cell.day)
                        ? "bg-primary/[0.12] ring-2 ring-primary/35"
                        : "ring-1 ring-transparent hover:bg-secondary/40"
                    }`}
                  >
                    <div
                      className={`flex shrink-0 items-center justify-center gap-1.5 text-sm tabular-nums ${
                        isToday(cell.day)
                          ? "font-semibold text-primary"
                          : "font-medium text-foreground"
                      }`}
                    >
                      <span>{cell.day}</span>
                      {dayMeetings.length > 0 ? (
                        <span
                          className="rounded-full bg-primary/20 px-1.5 py-px text-[10px] font-semibold text-primary"
                          aria-label={`${dayMeetings.length} rendez-vous`}
                        >
                          {dayMeetings.length}
                        </span>
                      ) : null}
                    </div>
                    <ul className="mt-1 max-h-[4.25rem] min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
                      {dayMeetings.map((m) => (
                        <li key={m.id} className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onMeetingClick(m)}
                            className="w-full truncate rounded-md border border-border/50 bg-secondary/50 px-1.5 py-1 text-left text-[10px] font-medium leading-tight text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary/10 hover:text-foreground touch-manipulation sm:text-[11px]"
                            title={m.title}
                            aria-label={`Ouvrir « ${m.title} »`}
                          >
                            {m.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="h-full min-h-[4.5rem] bg-muted/20" aria-hidden />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
