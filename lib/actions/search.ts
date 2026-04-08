"use server";

import { createServiceRoleClient } from "../supabase/service";
import { supabaseToError } from "../supabase/to-error";
import { requireUser } from "../auth/session";
import { slateSnippetToPlainText } from "../search/slate-snippet-plain";

export type GlobalSearchResult = {
  pageId: string;
  pageTitle: string;
  snippet: string;
  kind: "title" | "content";
};

type RpcRow = {
  page_id: string;
  page_title: string;
  snippet: string;
  kind: string;
};

/**
 * Déduplique par page : priorité au match sur le titre.
 */
function mergeSearchRows(rows: RpcRow[]): GlobalSearchResult[] {
  const map = new Map<string, GlobalSearchResult>();

  for (const r of rows) {
    const kind = r.kind === "title" ? "title" : "content";
    const rawSnippet = (r.snippet ?? "").trim();
    const snippet =
      kind === "content"
        ? slateSnippetToPlainText(rawSnippet)
        : rawSnippet || r.page_title;
    const row: GlobalSearchResult = {
      pageId: r.page_id,
      pageTitle: r.page_title,
      snippet,
      kind,
    };

    const existing = map.get(row.pageId);
    if (!existing) {
      map.set(row.pageId, row);
      continue;
    }
    if (existing.kind === "content" && row.kind === "title") {
      map.set(row.pageId, row);
    }
  }

  return [...map.values()].sort((a, b) => {
    if (a.kind === "title" && b.kind !== "title") return -1;
    if (b.kind === "title" && a.kind !== "title") return 1;
    return a.pageTitle.localeCompare(b.pageTitle, "fr", { sensitivity: "base" });
  });
}

/**
 * Recherche insensible à la casse dans les titres et dans le JSON des blocs (MVP).
 * Nécessite la fonction SQL `global_search_pages` (voir migrations).
 */
export async function globalSearch(rawQuery: string): Promise<GlobalSearchResult[]> {
  const user = await requireUser();
  const q = rawQuery.trim();
  if (!q) return [];

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc("global_search_pages", {
    p_user_id: user.uid,
    p_search: q,
  });

  if (error) throw supabaseToError(error);
  return mergeSearchRows((data ?? []) as RpcRow[]);
}
