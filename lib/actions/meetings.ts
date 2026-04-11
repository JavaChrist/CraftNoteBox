"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "../supabase/service";
import { supabaseToError } from "../supabase/to-error";
import { requireUser } from "../auth/session";
import { buildMeetingMinutesBlockSeeds } from "../blocks/meeting-minutes-template";
import type { PageScope } from "../db/types";
import type {
  CreateMeetingWithPageResult,
  Meeting,
  MeetingInput,
  MeetingLinkedPage,
  PickablePage,
} from "../meetings/types";

function revalidateMeetings() {
  revalidatePath("/meetings");
  revalidatePath("/home");
}

const MEETING_LIST_SELECT = `
  id,
  user_id,
  title,
  description,
  location,
  start_at,
  end_at,
  created_at,
  updated_at,
  minutes_page_id,
  meeting_pages (
    page_id,
    pages (
      id,
      title,
      scope
    )
  )
`;

function formatMinutesDateLine(start: Date, end: Date): string {
  const dateStr = start.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const t1 = start.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const t2 = end.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} · ${t1} – ${t2}`;
}

async function insertBlocksForPage(
  supabase: ReturnType<typeof createServiceRoleClient>,
  pageId: string,
  userId: string,
  seeds: ReturnType<typeof buildMeetingMinutesBlockSeeds>,
): Promise<void> {
  const now = new Date().toISOString();
  let i = 0;
  for (const seed of seeds) {
    const { error } = await supabase.from("blocks").insert({
      page_id: pageId,
      user_id: userId,
      type: seed.type,
      content: seed.content,
      order_index: i,
      created_at: now,
      updated_at: now,
    });
    if (error) throw supabaseToError(error);
    i += 1;
  }
}

async function fetchMeetingById(
  supabase: ReturnType<typeof createServiceRoleClient>,
  id: string,
): Promise<Meeting> {
  const { data: full, error: fetchErr } = await supabase
    .from("meetings")
    .select(MEETING_LIST_SELECT)
    .eq("id", id)
    .single();

  if (fetchErr) throw supabaseToError(fetchErr);
  const r = full as MeetingRow & { meeting_pages: NestedMeetingPage[] | null };
  const { meeting_pages, ...rest } = r;
  return rowToMeeting(rest, meeting_pages);
}

/** PostgREST : table absente du cache schéma (migration non appliquée). */
function isMeetingsTableMissing(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "PGRST205") return true;
  const msg = error.message ?? "";
  return (
    msg.includes("PGRST205") &&
    (msg.includes("meetings") || msg.includes("'meetings'"))
  );
}

export type MeetingsListResult = {
  meetings: Meeting[];
  /** `true` si `public.meetings` n’existe pas encore sur le projet Supabase. */
  schemaMissing: boolean;
};

type MeetingRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_at: string;
  end_at: string;
  created_at: string;
  updated_at: string;
  minutes_page_id?: string | null;
};

type NestedMeetingPage = {
  page_id: string;
  pages:
    | { id: string; title: string; scope: string | null }
    | { id: string; title: string; scope: string | null }[]
    | null;
};

function scopeFromRow(s: string | null | undefined): PageScope {
  return s === "pro" ? "pro" : "private";
}

function parseLinkedPages(rows: NestedMeetingPage[] | null): MeetingLinkedPage[] {
  if (!rows?.length) return [];
  const out: MeetingLinkedPage[] = [];
  for (const row of rows) {
    const p = row.pages;
    const page = Array.isArray(p) ? p[0] : p;
    if (!page?.id) continue;
    out.push({
      id: page.id,
      title: page.title || "Sans titre",
      scope: scopeFromRow(page.scope),
    });
  }
  return out;
}

function rowToMeeting(
  row: MeetingRow,
  linked: NestedMeetingPage[] | null,
): Meeting {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    location: row.location,
    startAt: row.start_at,
    endAt: row.end_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    minutesPageId: row.minutes_page_id ?? null,
    linkedPages: parseLinkedPages(linked),
  };
}

/** Toutes les pages de l’utilisateur pour le sélecteur (privées + PRO). */
export async function listPagesForMeetingPicker(): Promise<PickablePage[]> {
  const user = await requireUser();
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("pages")
    .select("id, title, scope")
    .eq("user_id", user.uid)
    .is("deleted_at", null)
    .order("title", { ascending: true });

  if (error) throw supabaseToError(error);
  return ((data ?? []) as { id: string; title: string; scope: string | null }[]).map(
    (r) => ({
      id: r.id,
      title: r.title || "Sans titre",
      scope: scopeFromRow(r.scope),
    }),
  );
}

/**
 * Rendez-vous (à partir d’il y a un an) + liens pages.
 * Si la migration `meetings` n’est pas appliquée, retourne `meetings: []` et `schemaMissing: true` (pas de crash).
 */
export async function listMeetingsWithLinks(): Promise<MeetingsListResult> {
  const user = await requireUser();
  const supabase = createServiceRoleClient();

  const from = new Date();
  from.setFullYear(from.getFullYear() - 1);

  const { data, error } = await supabase
    .from("meetings")
    .select(MEETING_LIST_SELECT)
    .eq("user_id", user.uid)
    .gte("start_at", from.toISOString())
    .order("start_at", { ascending: true })
    .limit(500);

  if (error) {
    if (isMeetingsTableMissing(error)) {
      console.warn(
        "[CraftNoteBox] Table public.meetings absente — exécute supabase/migrations/20260412000000_meetings.sql sur ton projet Supabase.",
      );
      return { meetings: [], schemaMissing: true };
    }
    throw supabaseToError(error);
  }

  const meetings = ((data ?? []) as (MeetingRow & {
    meeting_pages: NestedMeetingPage[] | null;
  })[]).map((row) => {
    const { meeting_pages, ...rest } = row;
    return rowToMeeting(rest, meeting_pages);
  });

  return { meetings, schemaMissing: false };
}

async function assertOwnPages(
  supabase: ReturnType<typeof createServiceRoleClient>,
  userId: string,
  pageIds: string[],
): Promise<void> {
  if (pageIds.length === 0) return;
  const unique = [...new Set(pageIds)];
  const { data, error } = await supabase
    .from("pages")
    .select("id")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .in("id", unique);

  if (error) throw supabaseToError(error);
  const ok = new Set((data ?? []).map((r: { id: string }) => r.id));
  if (ok.size !== unique.length) {
    throw new Error("Une ou plusieurs pages liées sont introuvables.");
  }
}

async function replaceMeetingPageLinks(
  supabase: ReturnType<typeof createServiceRoleClient>,
  meetingId: string,
  pageIds: string[],
): Promise<void> {
  const { error: delErr } = await supabase
    .from("meeting_pages")
    .delete()
    .eq("meeting_id", meetingId);

  if (delErr) throw supabaseToError(delErr);

  if (pageIds.length === 0) return;

  const rows = pageIds.map((page_id) => ({ meeting_id: meetingId, page_id }));
  const { error: insErr } = await supabase.from("meeting_pages").insert(rows);
  if (insErr) throw supabaseToError(insErr);
}

/**
 * Crée le meeting ; optionnellement une page « [titre] - Compte rendu » avec blocs Slate,
 * et lie les pages via `meeting_pages` (compte rendu + pages choisies).
 */
export async function createMeetingWithPage(
  input: MeetingInput,
): Promise<CreateMeetingWithPageResult> {
  const user = await requireUser();
  const supabase = createServiceRoleClient();

  const title = input.title.trim();
  if (!title) throw new Error("Le titre est obligatoire.");

  const start = new Date(input.startAt);
  const end = new Date(input.endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Date ou heure invalide.");
  }
  if (end <= start) throw new Error("L’heure de fin doit être après le début.");

  await assertOwnPages(supabase, user.uid, input.pageIds);

  const wantMinutes = input.createMinutesPage !== false;
  let minutesPageId: string | null = null;

  if (wantMinutes) {
    const pageTitle = `${title} - Compte rendu`;
    const { data: pageRow, error: pageErr } = await supabase
      .from("pages")
      .insert({
        user_id: user.uid,
        title: pageTitle,
        parent_id: null,
        icon: null,
        scope: "private",
      })
      .select("id")
      .single();

    if (pageErr) throw supabaseToError(pageErr);
    minutesPageId = (pageRow as { id: string }).id;

    const seeds = buildMeetingMinutesBlockSeeds(
      title,
      formatMinutesDateLine(start, end),
    );
    await insertBlocksForPage(supabase, minutesPageId, user.uid, seeds);
  }

  const { data: meetRow, error: meetErr } = await supabase
    .from("meetings")
    .insert({
      user_id: user.uid,
      title,
      description: input.description?.trim() || null,
      location: input.location?.trim() || null,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      minutes_page_id: minutesPageId,
    })
    .select("id")
    .single();

  if (meetErr) throw supabaseToError(meetErr);

  const meetingId = (meetRow as { id: string }).id;
  const linkIds =
    minutesPageId ?
      [...new Set([minutesPageId, ...input.pageIds])]
    : [...new Set(input.pageIds)];
  await replaceMeetingPageLinks(supabase, meetingId, linkIds);

  revalidateMeetings();
  revalidatePath("/pages");
  if (minutesPageId) {
    revalidatePath(`/pages/${minutesPageId}`);
  }

  const meeting = await fetchMeetingById(supabase, meetingId);
  return { meeting, minutesPageId };
}

/** @deprecated Préfère `createMeetingWithPage` ; conservé pour compatibilité (même comportement). */
export async function createMeeting(input: MeetingInput): Promise<Meeting> {
  const { meeting } = await createMeetingWithPage(input);
  return meeting;
}

export async function updateMeeting(
  id: string,
  input: MeetingInput,
): Promise<Meeting> {
  const user = await requireUser();
  const supabase = createServiceRoleClient();

  const { data: existing, error: exErr } = await supabase
    .from("meetings")
    .select("user_id, minutes_page_id")
    .eq("id", id)
    .maybeSingle();

  if (exErr) throw supabaseToError(exErr);
  if (!existing || (existing as { user_id: string }).user_id !== user.uid) {
    throw new Error("Rendez-vous introuvable.");
  }

  const minutesId = (existing as { minutes_page_id?: string | null })
    .minutes_page_id;

  const title = input.title.trim();
  if (!title) throw new Error("Le titre est obligatoire.");

  const start = new Date(input.startAt);
  const end = new Date(input.endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Date ou heure invalide.");
  }
  if (end <= start) throw new Error("L’heure de fin doit être après le début.");

  await assertOwnPages(supabase, user.uid, input.pageIds);

  const linkIds = [
    ...new Set([
      ...(minutesId ? [minutesId] : []),
      ...input.pageIds,
    ]),
  ];

  const { error: upErr } = await supabase
    .from("meetings")
    .update({
      title,
      description: input.description?.trim() || null,
      location: input.location?.trim() || null,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.uid);

  if (upErr) throw supabaseToError(upErr);

  await replaceMeetingPageLinks(supabase, id, linkIds);
  revalidateMeetings();

  return fetchMeetingById(supabase, id);
}

export async function deleteMeeting(id: string): Promise<void> {
  const user = await requireUser();
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("meetings")
    .delete()
    .eq("id", id)
    .eq("user_id", user.uid);

  if (error) throw supabaseToError(error);
  revalidateMeetings();
}
