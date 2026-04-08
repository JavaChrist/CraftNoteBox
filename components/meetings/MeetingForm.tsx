"use client";

import { useEffect, useState } from "react";
import type { Meeting, PickablePage } from "@/lib/meetings/types";
import LinkedPagesField from "@/components/meetings/LinkedPagesField";

function isoToDateAndTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return { date: `${y}-${m}-${day}`, time: `${hh}:${mm}` };
}

function localDateTimeToIso(date: string, time: string): string {
  const [y, mo, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  if (
    !y ||
    !mo ||
    !d ||
    Number.isNaN(hh) ||
    Number.isNaN(mm)
  ) {
    return "";
  }
  return new Date(y, mo - 1, d, hh, mm, 0, 0).toISOString();
}

type Props = {
  pickablePages: PickablePage[];
  /** `null` = création ; `Meeting` = édition. */
  editing?: Meeting | null;
  onSubmit: (data: {
    title: string;
    description: string | null;
    location: string | null;
    startAt: string;
    endAt: string;
    pageIds: string[];
  }) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
};

export default function MeetingForm({
  pickablePages,
  editing,
  onSubmit,
  onCancel,
  submitting,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(() => isoToDateAndTime(new Date().toISOString()).date);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [pageIds, setPageIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) {
      const now = new Date();
      const { date: d } = isoToDateAndTime(now.toISOString());
      setTitle("");
      setDescription("");
      setLocation("");
      setDate(d);
      setStartTime("09:00");
      setEndTime("10:00");
      setPageIds([]);
      setError(null);
      return;
    }
    setTitle(editing.title);
    setDescription(editing.description ?? "");
    setLocation(editing.location ?? "");
    const s = isoToDateAndTime(editing.startAt);
    const e = isoToDateAndTime(editing.endAt);
    setDate(s.date);
    setStartTime(s.time);
    setEndTime(e.time);
    setPageIds(editing.linkedPages.map((p) => p.id));
    setError(null);
  }, [editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const startAt = localDateTimeToIso(date, startTime);
    const endAt = localDateTimeToIso(date, endTime);
    if (!startAt || !endAt) {
      setError("Date ou heures invalides.");
      return;
    }
    if (new Date(endAt) <= new Date(startAt)) {
      setError("L’heure de fin doit être après le début.");
      return;
    }
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        startAt,
        endAt,
        pageIds,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l’enregistrement");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="m-title" className="text-sm font-medium text-foreground">
          Titre <span className="text-destructive">*</span>
        </label>
        <input
          id="m-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Ex. Point hebdo équipe"
          disabled={submitting}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label htmlFor="m-date" className="text-sm font-medium text-foreground">
            Date <span className="text-destructive">*</span>
          </label>
          <input
            id="m-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="m-start" className="text-sm font-medium text-foreground">
            Début <span className="text-destructive">*</span>
          </label>
          <input
            id="m-start"
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="m-end" className="text-sm font-medium text-foreground">
            Fin <span className="text-destructive">*</span>
          </label>
          <input
            id="m-end"
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            disabled={submitting}
          />
        </div>
      </div>

      <div>
        <label htmlFor="m-loc" className="text-sm font-medium text-foreground">
          Lieu <span className="text-muted-foreground">(optionnel)</span>
        </label>
        <input
          id="m-loc"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Salle, lien visio…"
          disabled={submitting}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="m-desc" className="text-sm font-medium text-foreground">
          Description <span className="text-muted-foreground">(optionnel)</span>
        </label>
        <textarea
          id="m-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Ordre du jour, objectifs…"
          disabled={submitting}
        />
      </div>

      <LinkedPagesField
        pages={pickablePages}
        value={pageIds}
        onChange={setPageIds}
        disabled={submitting}
      />

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-secondary"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting
            ? "Enregistrement…"
            : editing
              ? "Enregistrer"
              : "Créer le rendez-vous"}
        </button>
      </div>
    </form>
  );
}
