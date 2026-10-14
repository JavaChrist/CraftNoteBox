import type { BlockType } from "@/types/block";
import { blocksToSlateValue } from "@/lib/editor/slate-value";
import { pageToMarkdown } from "@/lib/export/markdown";
import { createStoredZip } from "@/lib/export/zip-store";

export type ArchivePage = {
  id: string;
  title: string;
  parentId: string | null;
  scope: "private" | "pro";
  updatedAt: string;
};

export type ArchiveBlock = {
  id: string;
  pageId: string;
  type: string;
  content: unknown;
  orderIndex: number;
};

export type ArchiveFile = {
  path: string;
  content: string;
};

function fileSlug(title: string): string {
  const cleaned = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return cleaned || "sans-titre";
}

function uniquePath(wanted: string, used: Set<string>): string {
  if (!used.has(wanted)) {
    used.add(wanted);
    return wanted;
  }
  const dot = wanted.lastIndexOf(".");
  const base = dot >= 0 ? wanted.slice(0, dot) : wanted;
  const ext = dot >= 0 ? wanted.slice(dot) : "";
  let index = 2;
  let next = `${base}-${index}${ext}`;
  while (used.has(next)) {
    index += 1;
    next = `${base}-${index}${ext}`;
  }
  used.add(next);
  return next;
}

function pageFilePath(
  page: ArchivePage,
  byId: Map<string, ArchivePage>,
  parentIds: Set<string>,
): string {
  const names: string[] = [];
  const seen = new Set<string>();
  let current: ArchivePage | undefined = page;
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    names.push(fileSlug(current.title));
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  names.reverse();
  const ownName = names.pop() ?? "sans-titre";
  const folder = page.scope === "pro" ? "pro" : "prive";
  if (parentIds.has(page.id)) {
    return [folder, ...names, ownName, "index.md"].join("/");
  }
  return [folder, ...names, `${ownName}.md`].join("/");
}

export function buildArchiveFiles(
  pages: ArchivePage[],
  blocks: ArchiveBlock[],
  exportedAt: string,
): ArchiveFile[] {
  const byId = new Map(pages.map((page) => [page.id, page]));
  const parentIds = new Set(
    pages.map((page) => page.parentId).filter((id): id is string => Boolean(id)),
  );
  const blocksByPage = new Map<string, ArchiveBlock[]>();
  for (const block of blocks) {
    const list = blocksByPage.get(block.pageId) ?? [];
    list.push(block);
    blocksByPage.set(block.pageId, list);
  }

  const used = new Set<string>();
  const files: ArchiveFile[] = pages
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title, "fr"))
    .map((page) => {
      const pageBlocks = (blocksByPage.get(page.id) ?? [])
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex);
      const slate = blocksToSlateValue(
        pageBlocks.map((block) => ({
          id: block.id,
          pageId: block.pageId,
          userId: "",
          type: block.type as BlockType,
          content: block.content,
          orderIndex: block.orderIndex,
          createdAt: page.updatedAt,
          updatedAt: page.updatedAt,
        })),
      );
      return {
        path: uniquePath(pageFilePath(page, byId, parentIds), used),
        content: pageToMarkdown({
          title: page.title,
          scope: page.scope,
          id: page.id,
          updatedAt: page.updatedAt,
          blocks: slate,
        }),
      };
    });

  const readme = [
    "# Archive CraftNoteBox",
    "",
    `Export du ${exportedAt}.`,
    "Les pages encore dans la corbeille ne sont pas incluses.",
    "Les dossiers `prive/` et `pro/` reprennent l’arborescence des pages.",
    "",
  ].join("\n");

  return [{ path: "LISEZMOI.md", content: readme }, ...files];
}

export function buildArchiveZip(
  pages: ArchivePage[],
  blocks: ArchiveBlock[],
  exportedAt = new Date(),
): Uint8Array {
  const files = buildArchiveFiles(pages, blocks, exportedAt.toISOString());
  const encoder = new TextEncoder();
  return createStoredZip(
    files.map((file) => ({ path: file.path, data: encoder.encode(file.content) })),
    exportedAt,
  );
}
