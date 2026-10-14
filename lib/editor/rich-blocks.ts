import type { Descendant } from "slate";
import type {
  BlockType,
  CalloutTone,
  ChartKind,
  ChartPoint,
  DbColumn,
  DbColumnKind,
  DbRow,
  DbView,
  SlashBlockPreset,
} from "@/types/block";
import {
  DEFAULT_CODE_LANGUAGE,
  normalizeCodeLanguage,
} from "@/lib/editor/code-languages";

export const CALLOUT_TONES: CalloutTone[] = [
  "note",
  "info",
  "success",
  "warning",
  "danger",
];

export const DB_VIEWS: DbView[] = [
  "table",
  "kanban",
  "gallery",
  "list",
  "feed",
  "dashboard",
  "calendar",
  "timeline",
];

export const DB_VIEW_LABELS: Record<DbView, string> = {
  table: "Table",
  kanban: "Kanban",
  gallery: "Galerie",
  list: "Liste",
  feed: "Fil",
  dashboard: "Tableau de bord",
  calendar: "Calendrier",
  timeline: "Chronologie",
};

export const CHART_KINDS: ChartKind[] = ["bar", "line", "donut"];

export const CHART_KIND_LABELS: Record<ChartKind, string> = {
  bar: "Barres",
  line: "Lignes",
  donut: "Anneau",
};

export const CALLOUT_TONE_LABELS: Record<CalloutTone, string> = {
  note: "Note",
  info: "Info",
  success: "Succès",
  warning: "Attention",
  danger: "Alerte",
};

const COLUMN_KINDS: DbColumnKind[] = ["text", "number", "date", "select"];

export function normalizeCalloutTone(value: unknown): CalloutTone {
  return CALLOUT_TONES.includes(value as CalloutTone)
    ? (value as CalloutTone)
    : "note";
}

export function normalizeDbView(value: unknown): DbView {
  return DB_VIEWS.includes(value as DbView) ? (value as DbView) : "table";
}

export function normalizeChartKind(value: unknown): ChartKind {
  return CHART_KINDS.includes(value as ChartKind)
    ? (value as ChartKind)
    : "bar";
}

export function newBlockId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rand}`;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function defaultTableHeaders(): string[] {
  return ["Colonne 1", "Colonne 2", "Colonne 3"];
}

export function defaultTableRows(): string[][] {
  return [
    ["", "", ""],
    ["", "", ""],
  ];
}

export function defaultDatabaseColumns(): DbColumn[] {
  return [
    { id: "col-name", name: "Nom", kind: "text" },
    {
      id: "col-status",
      name: "Statut",
      kind: "select",
      options: ["À faire", "En cours", "Terminé"],
    },
    { id: "col-date", name: "Date", kind: "date" },
    { id: "col-amount", name: "Montant", kind: "number" },
  ];
}

export function defaultDatabaseRows(): DbRow[] {
  return [
    {
      id: "row-1",
      cells: {
        "col-name": "Idée",
        "col-status": "À faire",
        "col-date": "2026-01-15",
        "col-amount": "10",
      },
    },
    {
      id: "row-2",
      cells: {
        "col-name": "Brouillon",
        "col-status": "En cours",
        "col-date": "2026-02-02",
        "col-amount": "25",
      },
    },
    {
      id: "row-3",
      cells: {
        "col-name": "Publication",
        "col-status": "Terminé",
        "col-date": "2026-03-20",
        "col-amount": "40",
      },
    },
  ];
}

export function defaultChartPoints(): ChartPoint[] {
  return [
    { label: "Jan", value: 4 },
    { label: "Fév", value: 7 },
    { label: "Mar", value: 5 },
    { label: "Avr", value: 9 },
  ];
}

export function alignTable(
  headers: string[],
  rows: string[][],
): { headers: string[]; rows: string[][] } {
  const safeHeaders =
    headers.length > 0 ? headers.map((h) => h) : defaultTableHeaders();
  const width = safeHeaders.length;
  const source = rows.length > 0 ? rows : defaultTableRows();
  const safeRows = source.map((row) => {
    const next = row.slice(0, width).map((cell) => asString(cell));
    while (next.length < width) next.push("");
    return next;
  });
  return { headers: safeHeaders, rows: safeRows };
}

function sanitizeColumn(raw: unknown, index: number): DbColumn | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const kind = COLUMN_KINDS.includes(obj.kind as DbColumnKind)
    ? (obj.kind as DbColumnKind)
    : "text";
  const options = asStringArray(obj.options).map((item) => item.trim());
  return {
    id: asString(obj.id, `col-${index + 1}`),
    name: asString(obj.name, `Colonne ${index + 1}`),
    kind,
    ...(kind === "select"
      ? { options: options.some((item) => item.length > 0) ? options : ["Option"] }
      : {}),
  };
}

function sanitizeRow(raw: unknown, index: number, columns: DbColumn[]): DbRow | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const cellsRaw =
    obj.cells && typeof obj.cells === "object" && !Array.isArray(obj.cells)
      ? (obj.cells as Record<string, unknown>)
      : {};
  const cells: Record<string, string> = {};
  for (const column of columns) {
    cells[column.id] = asString(cellsRaw[column.id]);
  }
  return {
    id: asString(obj.id, `row-${index + 1}`),
    cells,
  };
}

export function sanitizeDatabase(raw: {
  view?: unknown;
  dbColumns?: unknown;
  dbRows?: unknown;
}): { view: DbView; dbColumns: DbColumn[]; dbRows: DbRow[] } {
  const view = normalizeDbView(raw.view);
  const columns = Array.isArray(raw.dbColumns)
    ? raw.dbColumns
        .map((column, index) => sanitizeColumn(column, index))
        .filter((column): column is DbColumn => column !== null)
    : [];
  const dbColumns = columns.length > 0 ? columns : defaultDatabaseColumns();
  const rows = Array.isArray(raw.dbRows)
    ? raw.dbRows
        .map((row, index) => sanitizeRow(row, index, dbColumns))
        .filter((row): row is DbRow => row !== null)
    : [];
  return {
    view,
    dbColumns,
    dbRows: rows.length > 0 ? rows : defaultDatabaseRows(),
  };
}

export function sanitizeChart(raw: {
  chartKind?: unknown;
  chartPoints?: unknown;
}): { chartKind: ChartKind; chartPoints: ChartPoint[] } {
  const chartKind = normalizeChartKind(raw.chartKind);
  const points = Array.isArray(raw.chartPoints)
    ? raw.chartPoints.flatMap((point) => {
        if (!point || typeof point !== "object") return [];
        const obj = point as Record<string, unknown>;
        const value = typeof obj.value === "number" ? obj.value : Number(obj.value);
        if (!Number.isFinite(value)) return [];
        return [{ label: asString(obj.label, "—"), value }];
      })
    : [];
  return {
    chartKind,
    chartPoints: points.length > 0 ? points : defaultChartPoints(),
  };
}

/** Champs persistés à réinjecter au chargement d’un nœud. */
export function richFieldsFromRaw(
  type: BlockType,
  obj: Record<string, unknown>,
): Record<string, unknown> {
  if (type === "video" || type === "audio" || type === "embed") {
    return { url: asString(obj.url) };
  }
  if (type === "callout") {
    return {
      icon: asString(obj.icon, "💡") || "💡",
      tone: normalizeCalloutTone(obj.tone),
    };
  }
  if (type === "page_link" || type === "page_embed") {
    return {
      pageId: asString(obj.pageId),
      pageTitle: asString(obj.pageTitle),
    };
  }
  if (type === "table") {
    const aligned = alignTable(asStringArray(obj.headers), Array.isArray(obj.rows)
      ? obj.rows.map((row) => asStringArray(row))
      : []);
    return aligned;
  }
  if (type === "database") {
    return sanitizeDatabase(obj);
  }
  if (type === "chart") {
    return sanitizeChart(obj);
  }
  return {};
}

export function applyPreset(
  type: BlockType,
  node: Record<string, unknown>,
  preset?: SlashBlockPreset,
): Record<string, unknown> {
  if (!preset) return node;
  if (type === "database" && preset.view) {
    return { ...node, view: normalizeDbView(preset.view) };
  }
  if (type === "chart" && preset.chartKind) {
    return { ...node, chartKind: normalizeChartKind(preset.chartKind) };
  }
  return node;
}

export type EmbedResolution =
  | { kind: "iframe"; src: string; title: string }
  | { kind: "link"; href: string; title: string };

function youtubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id || null;
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
      return parts[1] || null;
    }
  }
  return null;
}

function vimeoId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const id = parts[parts.length - 1];
  return id && /^\d+$/.test(id) ? id : null;
}

export function resolveVideoSource(
  raw: string,
): { kind: "iframe" | "file"; src: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const yt = youtubeId(url);
  if (yt) {
    return {
      kind: "iframe",
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}`,
    };
  }
  const vimeo = vimeoId(url);
  if (vimeo) {
    return {
      kind: "iframe",
      src: `https://player.vimeo.com/video/${encodeURIComponent(vimeo)}`,
    };
  }
  return { kind: "file", src: trimmed };
}

export function resolveEmbed(raw: string): EmbedResolution | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\./, "");

  const yt = youtubeId(url);
  if (yt) {
    return {
      kind: "iframe",
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}`,
      title: "YouTube",
    };
  }
  const vimeo = vimeoId(url);
  if (vimeo) {
    return {
      kind: "iframe",
      src: `https://player.vimeo.com/video/${encodeURIComponent(vimeo)}`,
      title: "Vimeo",
    };
  }

  if (host === "loom.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[0] === "share" || parts[0] === "embed" ? parts[1] : "";
    if (id) {
      return {
        kind: "iframe",
        src: `https://www.loom.com/embed/${encodeURIComponent(id)}`,
        title: "Loom",
      };
    }
  }

  if (host === "open.spotify.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const kind = parts[0] === "embed" ? parts[1] : parts[0];
    const id = parts[0] === "embed" ? parts[2] : parts[1];
    if (
      id &&
      (kind === "track" || kind === "playlist" || kind === "album" || kind === "episode")
    ) {
      return {
        kind: "iframe",
        src: `https://open.spotify.com/embed/${kind}/${encodeURIComponent(id)}`,
        title: "Spotify",
      };
    }
  }

  if (host === "figma.com") {
    return {
      kind: "iframe",
      src: `https://www.figma.com/embed?embed_host=craftnotebox&url=${encodeURIComponent(url.href)}`,
      title: "Figma",
    };
  }

  if (host === "codepen.io") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 3 && parts[1] === "pen") {
      return {
        kind: "iframe",
        src: `https://codepen.io/${encodeURIComponent(parts[0])}/embed/${encodeURIComponent(parts[2])}?default-tab=result`,
        title: "CodePen",
      };
    }
  }

  if (host === "docs.google.com") {
    const preview = url.pathname.replace(/\/edit.*$/, "/preview").replace(/\/view.*$/, "/preview");
    if (/\/(document|spreadsheets|presentation)\//.test(preview)) {
      return {
        kind: "iframe",
        src: `https://docs.google.com${preview}`,
        title: "Google",
      };
    }
  }

  if (
    (host === "google.com" || host === "maps.google.com") &&
    url.pathname.includes("/maps")
  ) {
    const embed = new URL(url.href);
    embed.searchParams.set("output", "embed");
    return { kind: "iframe", src: embed.href, title: "Google Maps" };
  }

  return { kind: "link", href: url.href, title: host };
}

function textNode(text: string): Descendant {
  return { text } as Descendant;
}

function block(type: BlockType, text: string, extra?: Record<string, unknown>): Descendant {
  return { type, children: [textNode(text)], ...extra } as Descendant;
}

function parseCsvLine(line: string, delimiter: "," | ";"): string[] {
  const out: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      out.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  out.push(current.trim());
  return out;
}

export function parseCsvToTableNode(raw: string): Descendant {
  const lines = raw
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    const aligned = alignTable(defaultTableHeaders(), defaultTableRows());
    return {
      type: "table",
      ...aligned,
      children: [{ text: "" }],
    } as Descendant;
  }
  const sample = lines.slice(0, 5).join("\n");
  const delimiter: "," | ";" =
    (sample.match(/;/g) ?? []).length > (sample.match(/,/g) ?? []).length ? ";" : ",";
  const parsed = lines.map((line) => parseCsvLine(line, delimiter));
  const width = Math.max(...parsed.map((row) => row.length), 1);
  const header = parsed[0].concat(Array.from({ length: width - parsed[0].length }, () => ""));
  const body = (parsed.length > 1 ? parsed.slice(1) : [[]]).map((row) => {
    const next = row.slice(0, width);
    while (next.length < width) next.push("");
    return next;
  });
  return {
    type: "table",
    headers: header,
    rows: body,
    children: [{ text: "" }],
  } as Descendant;
}

function isTableSeparator(line: string): boolean {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function splitMarkdownRow(line: string): string[] {
  let value = line.trim();
  if (value.startsWith("|")) value = value.slice(1);
  if (value.endsWith("|")) value = value.slice(0, -1);
  return value.split("|").map((cell) => cell.trim());
}

/**
 * Convertit un fichier texte / Markdown léger en blocs racine.
 * Couvre titres, listes, tâches, citations, code, tableaux, images et séparateurs.
 */
export function parseMarkdownToSlateNodes(raw: string): Descendant[] {
  const lines = raw.replace(/\r\n/g, "\n").replace(/^\uFEFF/, "").split("\n");
  const out: Descendant[] = [];
  let i = 0;
  let inCode = false;
  let codeLang = DEFAULT_CODE_LANGUAGE;
  const codeLines: string[] = [];

  const pushParagraphLines = (buffer: string[]) => {
    const text = buffer.join(" ").trim();
    if (text) out.push(block("paragraph", text));
    buffer.length = 0;
  };
  const paragraph: string[] = [];

  const flushCode = () => {
    out.push({
      type: "code",
      language: codeLang,
      children: [{ text: codeLines.join("\n") }],
    } as Descendant);
    codeLines.length = 0;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      pushParagraphLines(paragraph);
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        inCode = true;
        codeLang = normalizeCodeLanguage(trimmed.slice(3).trim() || undefined);
      }
      i++;
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      i++;
      continue;
    }

    if (trimmed === "") {
      pushParagraphLines(paragraph);
      i++;
      continue;
    }

    if (
      i + 1 < lines.length &&
      trimmed.includes("|") &&
      isTableSeparator(lines[i + 1])
    ) {
      pushParagraphLines(paragraph);
      const headers = splitMarkdownRow(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().includes("|")) {
        rows.push(splitMarkdownRow(lines[i]));
        i++;
      }
      const aligned = alignTable(headers, rows.length > 0 ? rows : [[]]);
      out.push({
        type: "table",
        ...aligned,
        children: [{ text: "" }],
      } as Descendant);
      continue;
    }

    const image = /^!\[([^\]]*)\]\((https?:[^)\s]+)\)$/.exec(trimmed);
    if (image) {
      pushParagraphLines(paragraph);
      out.push({
        type: "image",
        url: image[2],
        alt: image[1],
        children: [{ text: "" }],
      } as Descendant);
      i++;
      continue;
    }

    const link = /^\[([^\]]+)\]\((https?:[^)\s]+)\)$/.exec(trimmed);
    if (link) {
      pushParagraphLines(paragraph);
      out.push({
        type: "bookmark",
        url: link[2],
        ogTitle: link[1],
        children: [{ text: "" }],
      } as Descendant);
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      pushParagraphLines(paragraph);
      out.push({ type: "divider", children: [{ text: "" }] } as Descendant);
      i++;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      pushParagraphLines(paragraph);
      out.push(block("heading3", trimmed.slice(4).trim()));
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      pushParagraphLines(paragraph);
      out.push(block("heading2", trimmed.slice(3).trim()));
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      pushParagraphLines(paragraph);
      out.push(block("heading1", trimmed.slice(2).trim()));
      i++;
      continue;
    }

    const todo = /^[-*]\s+\[( |x|X)\]\s+(.*)$/.exec(trimmed);
    if (todo) {
      pushParagraphLines(paragraph);
      out.push(
        block("todo", todo[2], { checked: todo[1].toLowerCase() === "x" }),
      );
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      pushParagraphLines(paragraph);
      out.push(block("bulleted_list", trimmed.replace(/^[-*]\s+/, "")));
      i++;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      pushParagraphLines(paragraph);
      out.push(block("numbered_list", trimmed.replace(/^\d+\.\s+/, "")));
      i++;
      continue;
    }

    if (trimmed.startsWith(">")) {
      pushParagraphLines(paragraph);
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      out.push(block("quote", quote.join(" ").trim()));
      continue;
    }

    paragraph.push(trimmed);
    i++;
  }

  if (inCode) flushCode();
  pushParagraphLines(paragraph);

  if (out.length === 0) {
    return [block("paragraph", "")];
  }
  return out;
}
