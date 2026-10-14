import { describe, expect, it } from "vitest";
import { createDefaultBlock } from "../blocks/schema";
import { blocksToSlateValue } from "./slate-value";
import { buildSlashMenuRows } from "./slash-menu-catalog";
import { slateSnippetToPlainText } from "../search/slate-snippet-plain";
import {
  parseCsvToTableNode,
  parseMarkdownToSlateNodes,
  resolveEmbed,
  resolveVideoSource,
} from "./rich-blocks";

describe("menu des blocs", () => {
  it("rend chaque entrée sélectionnable", () => {
    const { rows, selectableRowIndices } = buildSlashMenuRows("");
    const actionable = rows.filter((row) => row.kind !== "heading");
    expect(selectableRowIndices).toHaveLength(actionable.length);
    expect(actionable.some((row) => row.kind === "block" && row.type === "database")).toBe(
      true,
    );
    expect(actionable.some((row) => row.kind === "command")).toBe(true);
  });
});

describe("import markdown", () => {
  it("convertit les blocs courants et un tableau", () => {
    const nodes = parseMarkdownToSlateNodes(`# Titre

- [x] Fait
- Puce

> Une citation

| Nom | Note |
| --- | --- |
| Ada | 20 |

---
`);
    expect(nodes.map((node) => ("type" in node ? node.type : ""))).toEqual([
      "heading1",
      "todo",
      "bulleted_list",
      "quote",
      "table",
      "divider",
    ]);
    const table = nodes[4] as { headers: string[]; rows: string[][] };
    expect(table.headers).toEqual(["Nom", "Note"]);
    expect(table.rows).toEqual([["Ada", "20"]]);
    const todo = nodes[1] as { checked?: boolean };
    expect(todo.checked).toBe(true);
  });

  it("lit un csv séparé par des points-virgules", () => {
    const table = parseCsvToTableNode("Nom;Ville\nAda;Lyon\n") as {
      headers: string[];
      rows: string[][];
    };
    expect(table.headers).toEqual(["Nom", "Ville"]);
    expect(table.rows).toEqual([["Ada", "Lyon"]]);
  });
});

describe("intégrations", () => {
  it("transforme une URL YouTube en lecteur", () => {
    expect(resolveVideoSource("https://youtu.be/abc123")?.src).toBe(
      "https://www.youtube-nocookie.com/embed/abc123",
    );
    expect(resolveEmbed("https://open.spotify.com/track/xyz")?.kind).toBe("iframe");
    expect(resolveEmbed("https://example.com/page")?.kind).toBe("link");
  });
});

describe("persistance", () => {
  it("restaure une base et un graphique", () => {
    const database = createDefaultBlock("database", { view: "kanban" });
    const chart = createDefaultBlock("chart", { chartKind: "donut" });
    const value = blocksToSlateValue([
      {
        id: "1",
        pageId: "p",
        userId: "u",
        type: "database",
        content: database,
        orderIndex: 0,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "2",
        pageId: "p",
        userId: "u",
        type: "chart",
        content: chart,
        orderIndex: 1,
        createdAt: "",
        updatedAt: "",
      },
    ]);
    expect(value[0]).toMatchObject({ type: "database", view: "kanban" });
    expect(value[1]).toMatchObject({ type: "chart", chartKind: "donut" });
    expect(slateSnippetToPlainText(JSON.stringify(database))).toContain("Idée");
  });
});
