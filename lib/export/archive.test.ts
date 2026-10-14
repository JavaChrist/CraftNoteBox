import { describe, expect, it } from "vitest";
import { buildArchiveFiles } from "./archive";
import { blocksToMarkdown } from "./markdown";
import { crc32Of, createStoredZip } from "./zip-store";

describe("markdown", () => {
  it("conserve les retours à la ligne d’une zone de texte et aligne les listes", () => {
    const markdown = blocksToMarkdown([
      { type: "text_zone", children: [{ text: "ligne 1\nligne 2" }] },
      { type: "todo", checked: true, children: [{ text: "Fait" }] },
      { type: "todo", checked: false, children: [{ text: "À faire" }] },
      {
        type: "table",
        headers: ["Nom", "Note"],
        rows: [["Ada", "20"]],
        children: [{ text: "" }],
      },
    ]);

    expect(markdown).toContain("ligne 1\nligne 2");
    expect(markdown).toContain("- [x] Fait\n- [ ] À faire");
    expect(markdown).toContain("| Nom | Note |");
    expect(markdown).toContain("| Ada | 20 |");
  });
});

describe("archive", () => {
  it("range les pages dans leur dossier et évite les noms en double", () => {
    const files = buildArchiveFiles(
      [
        {
          id: "parent",
          title: "Projet",
          parentId: null,
          scope: "private",
          updatedAt: "2026-10-15T00:00:00.000Z",
        },
        {
          id: "child",
          title: "Notes",
          parentId: "parent",
          scope: "private",
          updatedAt: "2026-10-15T00:00:00.000Z",
        },
        {
          id: "other",
          title: "Notes",
          parentId: "parent",
          scope: "private",
          updatedAt: "2026-10-15T00:00:00.000Z",
        },
      ],
      [
        {
          id: "b1",
          pageId: "child",
          type: "paragraph",
          content: { type: "paragraph", children: [{ text: "Bonjour" }] },
          orderIndex: 0,
        },
      ],
      "2026-10-15T00:00:00.000Z",
    );

    expect(files.map((file) => file.path)).toEqual([
      "LISEZMOI.md",
      "prive/Projet/Notes.md",
      "prive/Projet/Notes-2.md",
      "prive/Projet/index.md",
    ]);
    expect(files[1]?.content).toContain("Bonjour");
    expect(files[2]?.content).toContain("espace: private");
  });
});

describe("zip", () => {
  it("écrit une archive STORE lisible", () => {
    const hello = new TextEncoder().encode("hello");
    expect(crc32Of(hello)).toBe(0x3610a686);

    const zip = createStoredZip(
      [{ path: "prive/note.md", data: hello }],
      new Date(2026, 9, 15, 12, 0, 0),
    );
    expect(zip[0]).toBe(0x50);
    expect(zip[1]).toBe(0x4b);
    expect(zip[2]).toBe(0x03);
    expect(zip[3]).toBe(0x04);

    const text = new TextDecoder().decode(zip);
    expect(text).toContain("prive/note.md");
    expect(text).toContain("hello");
    expect(zip[zip.length - 22]).toBe(0x50);
    expect(zip[zip.length - 21]).toBe(0x4b);
    expect(zip[zip.length - 20]).toBe(0x05);
    expect(zip[zip.length - 19]).toBe(0x06);
  });
});
