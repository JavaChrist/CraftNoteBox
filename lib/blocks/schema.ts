import type {
  BlockType,
  ChartKind,
  ChartPoint,
  DbColumn,
  DbRow,
  DbView,
  SlashBlockPreset,
} from "@/types/block";
import { DEFAULT_CODE_LANGUAGE } from "@/lib/editor/code-languages";
import { BLOCK_TYPES } from "@/lib/editor/block-types";
import {
  applyPreset,
  defaultChartPoints,
  defaultDatabaseColumns,
  defaultDatabaseRows,
  defaultTableHeaders,
  defaultTableRows,
} from "@/lib/editor/rich-blocks";

export { BLOCK_TYPES };

export const defaultContent = [
  {
    type: "paragraph" as const,
    children: [{ text: "" }],
  },
];

type SlateNode = {
  type: string;
  children: unknown[];
  checked?: boolean;
  open?: boolean;
  language?: string;
  url?: string;
  alt?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogSiteName?: string;
  icon?: string;
  tone?: "note" | "info" | "success" | "warning" | "danger";
  pageId?: string;
  pageTitle?: string;
  headers?: string[];
  rows?: string[][];
  view?: DbView;
  dbColumns?: DbColumn[];
  dbRows?: DbRow[];
  chartKind?: ChartKind;
  chartPoints?: ChartPoint[];
};

export function createDefaultBlock(
  type: BlockType,
  preset?: SlashBlockPreset,
): SlateNode {
  const node = createDefaultBlockNode(type);
  return applyPreset(type, node, preset) as SlateNode;
}

function createDefaultBlockNode(type: BlockType): SlateNode {
  switch (type) {
    case "divider":
      return { type: "divider", children: [{ text: "" }] };
    case "image":
      return {
        type: "image",
        url: "",
        alt: "",
        children: [{ text: "" }],
      };
    case "file":
      return {
        type: "file",
        url: "",
        fileName: "",
        children: [{ text: "" }],
      };
    case "bookmark":
      return {
        type: "bookmark",
        url: "",
        children: [{ text: "" }],
      };
    case "video":
    case "audio":
    case "embed":
      return { type, url: "", children: [{ text: "" }] };
    case "callout":
      return {
        type: "callout",
        icon: "💡",
        tone: "note",
        children: [{ text: "" }],
      };
    case "table":
      return {
        type: "table",
        headers: defaultTableHeaders(),
        rows: defaultTableRows(),
        children: [{ text: "" }],
      };
    case "page_link":
    case "page_embed":
      return { type, pageId: "", pageTitle: "", children: [{ text: "" }] };
    case "database":
      return {
        type: "database",
        view: "table",
        dbColumns: defaultDatabaseColumns(),
        dbRows: defaultDatabaseRows(),
        children: [{ text: "" }],
      };
    case "chart":
      return {
        type: "chart",
        chartKind: "bar",
        chartPoints: defaultChartPoints(),
        children: [{ text: "" }],
      };
    case "toggle":
      return {
        type: "toggle",
        open: true,
        children: [{ type: "paragraph", children: [{ text: "" }] }],
      };
    case "todo":
      return { type: "todo", checked: false, children: [{ text: "" }] };
    case "code":
      return {
        type: "code",
        language: DEFAULT_CODE_LANGUAGE,
        children: [{ text: "" }],
      };
    case "numbered_list":
    case "bulleted_list":
    case "quote":
    case "heading1":
    case "heading2":
    case "heading3":
    case "text_zone":
    case "paragraph":
      return { type, children: [{ text: "" }] };
    default:
      return { type: "paragraph", children: [{ text: "" }] };
  }
}
