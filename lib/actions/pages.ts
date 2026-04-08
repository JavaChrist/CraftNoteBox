"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "../supabase/service";
import { supabaseToError } from "../supabase/to-error";
import { requireUser } from "../auth/session";
import type { Page, PageScope } from "../db/types";

function revalidateAppNavigation() {
  revalidatePath("/home");
  revalidatePath("/pages");
  revalidatePath("/meetings");
  revalidatePath("/inbox");
  revalidatePath("/search");
  revalidatePath("/assistant");
}

type PageRow = {
  id: string;
  user_id: string;
  title: string;
  icon: string | null;
  parent_id: string | null;
  scope?: string | null;
  created_at: string;
  updated_at: string;
};

function rowScope(row: PageRow): PageScope {
  return row.scope === "pro" ? "pro" : "private";
}

function rowToPage(row: PageRow): Page {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    icon: row.icon,
    parentId: row.parent_id,
    scope: rowScope(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPages(scope: PageScope): Promise<Page[]> {
  const user = await requireUser();
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", user.uid)
    .eq("scope", scope)
    .order("updated_at", { ascending: false });

  if (error) throw supabaseToError(error);
  return (data as PageRow[]).map(rowToPage);
}

export async function getPage(pageId: string): Promise<Page | null> {
  const user = await requireUser();
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .maybeSingle();

  if (error) throw supabaseToError(error);
  if (!data) return null;
  const row = data as PageRow;
  if (row.user_id !== user.uid) {
    throw new Error("Accès refusé");
  }
  return rowToPage(row);
}

export async function createPage(input: {
  title?: string;
  parentId?: string | null;
  icon?: string | null;
  /** Ignoré si `parentId` est défini (héritage du parent). */
  scope?: PageScope;
}): Promise<Page> {
  const user = await requireUser();
  const supabase = createServiceRoleClient();

  const parentId = input.parentId ?? null;
  let scope: PageScope = input.scope ?? "private";

  if (parentId) {
    const { data: parentRow, error: parentErr } = await supabase
      .from("pages")
      .select("user_id, scope")
      .eq("id", parentId)
      .maybeSingle();

    if (parentErr) throw supabaseToError(parentErr);
    if (!parentRow || (parentRow as { user_id: string }).user_id !== user.uid) {
      throw new Error("Page parente introuvable ou accès refusé");
    }
    scope = rowScope(parentRow as PageRow);
  }

  const { data, error } = await supabase
    .from("pages")
    .insert({
      user_id: user.uid,
      title: input.title?.trim() || "Sans titre",
      parent_id: parentId,
      icon: input.icon ?? null,
      scope,
    })
    .select()
    .single();

  if (error) throw supabaseToError(error);
  revalidateAppNavigation();
  return rowToPage(data as PageRow);
}

export async function updatePage(input: {
  id: string;
  title?: string;
  parentId?: string | null;
  icon?: string | null;
}): Promise<Page> {
  const user = await requireUser();
  const supabase = createServiceRoleClient();

  const { data: existing, error: fetchErr } = await supabase
    .from("pages")
    .select("*")
    .eq("id", input.id)
    .maybeSingle();

  if (fetchErr) throw supabaseToError(fetchErr);
  if (!existing) throw new Error("Page introuvable");
  const row = existing as PageRow;
  if (row.user_id !== user.uid) {
    throw new Error("Accès refusé");
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) patch.title = input.title;
  if (input.parentId !== undefined) patch.parent_id = input.parentId;
  if (input.icon !== undefined) patch.icon = input.icon;

  if (input.parentId !== undefined && input.parentId !== null) {
    const { data: parentRow, error: parentErr } = await supabase
      .from("pages")
      .select("user_id, scope")
      .eq("id", input.parentId)
      .maybeSingle();

    if (parentErr) throw supabaseToError(parentErr);
    if (!parentRow || (parentRow as { user_id: string }).user_id !== user.uid) {
      throw new Error("Page parente introuvable ou accès refusé");
    }
    if (rowScope(parentRow as PageRow) !== rowScope(row)) {
      throw new Error(
        "La page parente doit être dans le même espace (privé ou PRO).",
      );
    }
  }

  const { data, error } = await supabase
    .from("pages")
    .update(patch)
    .eq("id", input.id)
    .eq("user_id", user.uid)
    .select()
    .single();

  if (error) throw supabaseToError(error);
  revalidatePath(`/pages/${input.id}`);
  revalidateAppNavigation();
  return rowToPage(data as PageRow);
}

export async function deletePage(pageId: string) {
  const user = await requireUser();
  const supabase = createServiceRoleClient();

  const { data: existing, error: fetchErr } = await supabase
    .from("pages")
    .select("user_id")
    .eq("id", pageId)
    .maybeSingle();

  if (fetchErr) throw supabaseToError(fetchErr);
  if (!existing) return;
  if ((existing as { user_id: string }).user_id !== user.uid) {
    throw new Error("Accès refusé");
  }

  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("id", pageId)
    .eq("user_id", user.uid);

  if (error) throw supabaseToError(error);
  revalidateAppNavigation();
  revalidatePath(`/pages/${pageId}`);
}
