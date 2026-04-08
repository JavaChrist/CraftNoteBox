import type { Page } from "@/lib/db/types";

export type PageTreeNode = Page & { children: PageTreeNode[] };

/**
 * Orphelins : parent absent de la liste → traités comme racines.
 */
export function normalizePagesForTree(pages: Page[]): Page[] {
  const ids = new Set(pages.map((p) => p.id));
  return pages.map((p) => ({
    ...p,
    parentId:
      p.parentId != null && ids.has(p.parentId) ? p.parentId : null,
  }));
}

/**
 * Arbre trié par `updatedAt` décroissant à chaque niveau.
 */
export function buildPageTree(pages: Page[]): PageTreeNode[] {
  const normalized = normalizePagesForTree(pages);
  const byParent = new Map<string | null, Page[]>();

  for (const p of normalized) {
    const key = p.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(p);
  }

  for (const arr of byParent.values()) {
    arr.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  function build(parentId: string | null): PageTreeNode[] {
    return (byParent.get(parentId) ?? []).map((p) => ({
      ...p,
      children: build(p.id),
    }));
  }

  return build(null);
}
