import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/session";
import { buildArchiveZip, type ArchiveBlock, type ArchivePage } from "@/lib/export/archive";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { supabaseToError } from "@/lib/supabase/to-error";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageRow = {
  id: string;
  title: string | null;
  parent_id: string | null;
  scope: string | null;
  updated_at: string;
};

type BlockRow = {
  id: string;
  page_id: string;
  type: string;
  content: unknown;
  order_index: number;
};

const pageSize = 1000;

async function selectAll<T>(
  run: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await run(from, from + pageSize - 1);
    if (error) throw supabaseToError(error);
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < pageSize) return rows;
  }
}

/**
 * Archive Markdown de toutes les pages hors corbeille.
 * Un fichier par page, rangé dans `prive/` ou `pro/`.
 */
export async function GET() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  let pageRows: PageRow[];
  let blockRows: BlockRow[];
  try {
    pageRows = await selectAll<PageRow>((from, to) =>
      supabase
        .from("pages")
        .select("id, title, parent_id, scope, updated_at")
        .eq("user_id", user.uid)
        .is("deleted_at", null)
        .order("id", { ascending: true })
        .range(from, to),
    );

    const pages: ArchivePage[] = pageRows.map((row) => ({
      id: row.id,
      title: row.title?.trim() || "Sans titre",
      parentId: row.parent_id,
      scope: row.scope === "pro" ? "pro" : "private",
      updatedAt: row.updated_at,
    }));

    blockRows =
      pages.length === 0
        ? []
        : await selectAll<BlockRow>((from, to) =>
            supabase
              .from("blocks")
              .select("id, page_id, type, content, order_index")
              .eq("user_id", user.uid)
              .order("id", { ascending: true })
              .range(from, to),
          );

    const livePageIds = new Set(pages.map((page) => page.id));
    const blocks: ArchiveBlock[] = blockRows
      .filter((row) => livePageIds.has(row.page_id))
      .map((row) => ({
        id: row.id,
        pageId: row.page_id,
        type: row.type,
        content: row.content,
        orderIndex: row.order_index,
      }));

    const exportedAt = new Date();
    const zip = buildArchiveZip(pages, blocks, exportedAt);
    const stamp = new Intl.DateTimeFormat("fr-CA", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(exportedAt);

    return new NextResponse(Buffer.from(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="craftnotebox-${stamp}.zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export impossible";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
