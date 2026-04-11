import { describe, expect, it } from "vitest";
import type { Page } from "../db/types";
import { buildPageTree, normalizePagesForTree } from "./build-page-tree";

function p(
  partial: Partial<Page> & { id: string; title: string },
): Page {
  const now = new Date().toISOString();
  return {
    userId: "u1",
    parentId: null,
    scope: "private",
    icon: null,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

describe("buildPageTree", () => {
  it("retourne une forêt vide", () => {
    expect(buildPageTree([])).toEqual([]);
  });

  it("orphelin sans parent dans la liste devient racine", () => {
    const pages = normalizePagesForTree([
      p({ id: "a", title: "A", parentId: "missing" }),
    ]);
    expect(pages[0].parentId).toBeNull();
    const tree = buildPageTree(pages);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("a");
  });

  it("imbrique parent → enfant", () => {
    const tree = buildPageTree([
      p({ id: "root", title: "R", parentId: null, updatedAt: "2024-01-02T00:00:00Z" }),
      p({
        id: "child",
        title: "C",
        parentId: "root",
        updatedAt: "2024-01-01T00:00:00Z",
      }),
    ]);
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe("child");
  });
});
