/**
 * Convertit des blocs Slate persistés en Markdown lisible.
 * Le but est une sauvegarde, pas une copie pixel près de l’éditeur.
 */

type Node = Record<string, unknown>;

function isRecord(value: unknown): value is Node {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function childrenOf(node: Node): unknown[] {
  return Array.isArray(node.children) ? node.children : [];
}

function inlineText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  if (typeof value.text === "string") return value.text;
  return childrenOf(value).map(inlineText).join("");
}

function cell(value: unknown): string {
  return asText(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function markdownTable(headers: string[], rows: string[][]): string {
  const width = Math.max(headers.length, ...rows.map((row) => row.length), 1);
  const head = Array.from({ length: width }, (_, index) => cell(headers[index] ?? ""));
  const body = rows.map((row) =>
    Array.from({ length: width }, (_, index) => cell(row[index] ?? "")),
  );
  const line = (values: string[]) => `| ${values.join(" | ")} |`;
  return [
    line(head),
    line(head.map(() => "---")),
    ...body.map(line),
  ].join("\n");
}

function listKind(node: Node): "ul" | "ol" | "todo" | null {
  if (node.type === "bulleted_list") return "ul";
  if (node.type === "numbered_list") return "ol";
  if (node.type === "todo") return "todo";
  return null;
}

function blockToMarkdown(node: Node): string {
  const type = asText(node.type);
  const text = inlineText(node).replace(/\s+$/g, "");

  switch (type) {
    case "heading1":
      return text ? `# ${text}` : "";
    case "heading2":
      return text ? `## ${text}` : "";
    case "heading3":
      return text ? `### ${text}` : "";
    case "text_zone":
      return inlineText(node).replace(/\s+$/g, "");
    case "bulleted_list":
      return text ? `- ${text}` : "-";
    case "numbered_list":
      return text ? `1. ${text}` : "1.";
    case "todo":
      return `- [${node.checked === true ? "x" : " "}] ${text}`.trimEnd();
    case "quote":
      return (text || " ").split("\n").map((line) => `> ${line}`).join("\n");
    case "divider":
      return "---";
    case "code": {
      const language = asText(node.language).replace(/[`\s]/g, "");
      const code = childrenOf(node).map(inlineText).join("");
      return `\`\`\`${language}\n${code.replace(/\s+$/g, "")}\n\`\`\``;
    }
    case "image": {
      const url = asText(node.url);
      if (!url) return "";
      return `![${asText(node.alt)}](${url})`;
    }
    case "file":
    case "bookmark":
    case "video":
    case "audio":
    case "embed": {
      const url = asText(node.url);
      if (!url) return "";
      const label =
        asText(node.fileName) ||
        asText(node.ogTitle) ||
        asText(node.alt) ||
        type;
      return `[${label}](${url})`;
    }
    case "callout": {
      const icon = asText(node.icon) || "💡";
      return text ? `> ${icon} ${text}` : `> ${icon}`;
    }
    case "table": {
      const headers = Array.isArray(node.headers) ? node.headers.map(cell) : [];
      const rows = Array.isArray(node.rows)
        ? node.rows.filter(Array.isArray).map((row) => row.map(cell))
        : [];
      return markdownTable(headers, rows);
    }
    case "database": {
      const columns = Array.isArray(node.dbColumns) ? node.dbColumns : [];
      const headers = columns.map((column) =>
        isRecord(column) ? asText(column.name) : "",
      );
      const rows = (Array.isArray(node.dbRows) ? node.dbRows : []).map((row) => {
        const cells = isRecord(row) && isRecord(row.cells) ? row.cells : {};
        return columns.map((column) => {
          const id = isRecord(column) ? asText(column.id) : "";
          return asText(cells[id]);
        });
      });
      const view = asText(node.view);
      const table = markdownTable(headers, rows);
      return view ? `Base (${view})\n\n${table}` : table;
    }
    case "chart": {
      const points = Array.isArray(node.chartPoints) ? node.chartPoints : [];
      const lines = points.map((point) => {
        if (!isRecord(point)) return "";
        return `- ${asText(point.label) || "—"} : ${asText(point.value) || String(point.value ?? "")}`;
      }).filter(Boolean);
      const kind = asText(node.chartKind);
      const title = kind ? `Graphique (${kind})` : "Graphique";
      return lines.length ? `${title}\n\n${lines.join("\n")}` : title;
    }
    case "page_link":
    case "page_embed": {
      const title = asText(node.pageTitle) || "page";
      const label = type === "page_embed" ? "Page incluse" : "Lien vers la page";
      return `${label} : ${title}`;
    }
    case "toggle": {
      const nested = childrenOf(node).filter(isRecord);
      const summary = nested.length ? inlineText(nested[0]).trim() : "";
      const rest = blocksToMarkdown(nested.slice(1));
      const head = `**${summary || "Repliable"}**`;
      return rest ? `${head}\n\n${rest}` : head;
    }
    default:
      return text;
  }
}

export function blocksToMarkdown(nodes: unknown[]): string {
  const parts: string[] = [];
  let previousList: "ul" | "ol" | "todo" | null = null;

  for (const raw of nodes) {
    if (!isRecord(raw)) continue;
    const markdown = blockToMarkdown(raw).trimEnd();
    if (!markdown) continue;
    const kind = listKind(raw);
    if (kind && kind === previousList && parts.length > 0) {
      parts[parts.length - 1] += `\n${markdown}`;
    } else {
      parts.push(markdown);
    }
    previousList = kind;
  }

  return parts.length ? `${parts.join("\n\n")}\n` : "";
}

function yamlString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ")}"`;
}

export function pageToMarkdown(input: {
  title: string;
  scope: "private" | "pro";
  id: string;
  updatedAt: string;
  blocks: unknown[];
}): string {
  const body = blocksToMarkdown(input.blocks);
  return [
    "---",
    `titre: ${yamlString(input.title || "Sans titre")}`,
    `espace: ${input.scope}`,
    `id: ${input.id}`,
    `modifie: ${yamlString(input.updatedAt)}`,
    "---",
    "",
    body,
  ].join("\n");
}
