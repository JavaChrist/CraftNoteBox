"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/session";
import type { PageSection } from "../db/types";
import {
  PAGE_SCOPES,
  PAGE_SCOPE_META,
  type BuiltinPageScope,
} from "../pages/scopes";
import {
  normalizeSectionTitle,
  sameSectionTitle,
  sectionShortLabelFromTitle,
  uniqueSectionSlug,
} from "../pages/section-slug";
import { createServiceRoleClient } from "../supabase/service";
import { supabaseToError } from "../supabase/to-error";

const CUSTOM_SECTION_LIMIT = 20;

type SectionRow = {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  short_label: string;
  sort_order: number;
  builtin: boolean;
};

function revalidateSections() {
  revalidatePath("/home");
  revalidatePath("/pages");
  revalidatePath("/trash");
  revalidatePath("/meetings");
  revalidatePath("/search");
  revalidatePath("/assistant");
}

function isSectionsTableMissing(error: { code?: string; message?: string }): boolean {
  if (error.code === "42P01" || error.code === "PGRST205") {
    const msg = error.message ?? "";
    return error.code === "42P01" || msg.includes("page_sections");
  }
  return (error.message ?? "").includes("page_sections");
}

function rowToSection(row: SectionRow): PageSection {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    title: row.title,
    shortLabel: row.short_label,
    sortOrder: row.sort_order,
    builtin: row.builtin,
    persisted: true,
  };
}

function fallbackSections(userId: string): PageSection[] {
  return PAGE_SCOPES.map((slug, index) => {
    const meta = PAGE_SCOPE_META[slug];
    return {
      id: `builtin:${slug}`,
      userId,
      slug,
      title: meta.title,
      shortLabel: meta.shortLabel,
      sortOrder: index,
      builtin: true,
      persisted: false,
    };
  });
}

function builtinInsert(userId: string, slug: BuiltinPageScope, sortOrder: number) {
  const meta = PAGE_SCOPE_META[slug];
  return {
    user_id: userId,
    slug,
    title: meta.title,
    short_label: meta.shortLabel,
    sort_order: sortOrder,
    builtin: true,
  };
}

export async function listSections(): Promise<PageSection[]> {
  const user = await requireUser();
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("page_sections")
    .select("id, user_id, slug, title, short_label, sort_order, builtin")
    .eq("user_id", user.uid)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isSectionsTableMissing(error)) return fallbackSections(user.uid);
    throw supabaseToError(error);
  }

  const rows = (data ?? []) as SectionRow[];
  const present = new Set(rows.map((row) => row.slug));
  const missing = PAGE_SCOPES.filter((slug) => !present.has(slug));

  if (missing.length > 0) {
    const start = rows.reduce((max, row) => Math.max(max, row.sort_order), -1) + 1;
    const { error: insertError } = await supabase
      .from("page_sections")
      .insert(
        missing.map((slug, index) => builtinInsert(user.uid, slug, start + index)),
      );

    if (insertError && !isSectionsTableMissing(insertError)) {
      const code = (insertError as { code?: string }).code;
      if (code !== "23505") throw supabaseToError(insertError);
    }

    const { data: refreshed, error: refreshError } = await supabase
      .from("page_sections")
      .select("id, user_id, slug, title, short_label, sort_order, builtin")
      .eq("user_id", user.uid)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (refreshError) throw supabaseToError(refreshError);
    return ((refreshed ?? []) as SectionRow[]).map(rowToSection);
  }

  return rows.map(rowToSection);
}

export async function createSection(input: { title: string }): Promise<PageSection> {
  const user = await requireUser();
  const title = normalizeSectionTitle(input.title);
  const supabase = createServiceRoleClient();
  const sections = await listSections();

  if (sections.some((section) => !section.persisted)) {
    throw new Error(
      "Les rubriques personnalisées ne sont pas encore disponibles. Réessaie dans un instant.",
    );
  }
  if (sections.some((section) => sameSectionTitle(section.title, title))) {
    throw new Error("Une rubrique porte déjà ce nom.");
  }
  if (sections.filter((section) => !section.builtin).length >= CUSTOM_SECTION_LIMIT) {
    throw new Error("Tu as atteint le nombre maximum de rubriques.");
  }

  const slug = uniqueSectionSlug(
    title,
    sections.map((section) => section.slug),
  );
  const sortOrder =
    sections.reduce((max, section) => Math.max(max, section.sortOrder), -1) + 1;

  const { data, error } = await supabase
    .from("page_sections")
    .insert({
      user_id: user.uid,
      slug,
      title,
      short_label: sectionShortLabelFromTitle(title),
      sort_order: sortOrder,
      builtin: false,
    })
    .select("id, user_id, slug, title, short_label, sort_order, builtin")
    .single();

  if (error) {
    if (isSectionsTableMissing(error)) {
      throw new Error(
        "Les rubriques personnalisées ne sont pas encore disponibles. Réessaie dans un instant.",
      );
    }
    throw supabaseToError(error);
  }

  revalidateSections();
  return rowToSection(data as SectionRow);
}

export async function renameSection(input: {
  id: string;
  title: string;
}): Promise<PageSection> {
  const user = await requireUser();
  const title = normalizeSectionTitle(input.title);
  const supabase = createServiceRoleClient();

  const { data: existing, error: fetchError } = await supabase
    .from("page_sections")
    .select("id, user_id, slug, title, short_label, sort_order, builtin")
    .eq("id", input.id)
    .maybeSingle();

  if (fetchError) throw supabaseToError(fetchError);
  if (!existing || (existing as SectionRow).user_id !== user.uid) {
    throw new Error("Rubrique introuvable.");
  }
  const row = existing as SectionRow;
  if (row.builtin) {
    throw new Error("Les rubriques d’origine ne peuvent pas être renommées.");
  }

  const sections = await listSections();
  if (
    sections.some(
      (section) => section.id !== row.id && sameSectionTitle(section.title, title),
    )
  ) {
    throw new Error("Une rubrique porte déjà ce nom.");
  }

  const { data, error } = await supabase
    .from("page_sections")
    .update({
      title,
      short_label: sectionShortLabelFromTitle(title),
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("user_id", user.uid)
    .select("id, user_id, slug, title, short_label, sort_order, builtin")
    .single();

  if (error) throw supabaseToError(error);
  revalidateSections();
  return rowToSection(data as SectionRow);
}

export async function deleteSection(id: string): Promise<void> {
  const user = await requireUser();
  const supabase = createServiceRoleClient();

  const { data: existing, error: fetchError } = await supabase
    .from("page_sections")
    .select("id, user_id, slug, builtin")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) throw supabaseToError(fetchError);
  if (!existing || (existing as { user_id: string }).user_id !== user.uid) {
    throw new Error("Rubrique introuvable.");
  }
  const row = existing as { id: string; slug: string; builtin: boolean };
  if (row.builtin) {
    throw new Error("Les rubriques d’origine ne peuvent pas être supprimées.");
  }

  const now = new Date().toISOString();
  const { error: moveError } = await supabase
    .from("pages")
    .update({ scope: "private", updated_at: now })
    .eq("user_id", user.uid)
    .eq("scope", row.slug);

  if (moveError) throw supabaseToError(moveError);

  const { error } = await supabase
    .from("page_sections")
    .delete()
    .eq("id", row.id)
    .eq("user_id", user.uid);

  if (error) throw supabaseToError(error);
  revalidateSections();
}
