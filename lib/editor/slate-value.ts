import { Element as SlateElement, Text, type Descendant } from "slate";
import type { Block } from "@/lib/db/types";
import type { BlockType } from "@/types/block";
import { normalizeCodeLanguage } from "@/lib/editor/code-languages";
import { isAllowedTextColor } from "@/lib/editor/text-color";

const VOID_TYPES = new Set<BlockType>(["divider", "image", "file", "bookmark"]);

/**
 * Garantit un arbre Slate valide (chaque bloc a au moins une feuille texte).
 * Évite l’erreur « no start text node » avec des JSON partiels ou vides en base.
 */
function repairNode(raw: unknown, fallbackBlockType: BlockType): Descendant {
  if (Text.isText(raw)) {
    const o = raw as Record<string, unknown>;
    const t = o.text;
    const text = typeof t === "string" ? t : "";
    const base: Record<string, unknown> = { text };
    if (typeof o.color === "string" && isAllowedTextColor(o.color)) {
      base.color = o.color.trim();
    }
    return base as Descendant;
  }

  if (!raw || typeof raw !== "object") {
    return { type: "paragraph", children: [{ text: "" }] };
  }

  const obj = raw as Record<string, unknown>;
  const type: BlockType =
    typeof obj.type === "string" ? (obj.type as BlockType) : fallbackBlockType;

  if (VOID_TYPES.has(type)) {
    const voidBase: Record<string, unknown> = {
      type,
      children: [{ text: "" }],
    };
    if (type === "image") {
      voidBase.url = typeof obj.url === "string" ? obj.url : "";
      voidBase.alt = typeof obj.alt === "string" ? obj.alt : "";
    }
    if (type === "file") {
      voidBase.url = typeof obj.url === "string" ? obj.url : "";
      voidBase.fileName =
        typeof obj.fileName === "string" ? obj.fileName : "";
      if (typeof obj.mimeType === "string") voidBase.mimeType = obj.mimeType;
      if (typeof obj.sizeBytes === "number" && Number.isFinite(obj.sizeBytes)) {
        voidBase.sizeBytes = obj.sizeBytes;
      }
    }
    if (type === "bookmark") {
      voidBase.url = typeof obj.url === "string" ? obj.url : "";
      if (typeof obj.ogTitle === "string") voidBase.ogTitle = obj.ogTitle;
      if (typeof obj.ogDescription === "string") {
        voidBase.ogDescription = obj.ogDescription;
      }
      if (typeof obj.ogImage === "string") voidBase.ogImage = obj.ogImage;
      if (typeof obj.ogSiteName === "string") {
        voidBase.ogSiteName = obj.ogSiteName;
      }
    }
    return voidBase as Descendant;
  }

  const rawChildren = Array.isArray(obj.children) ? obj.children : [];
  let children = rawChildren.map((c) => repairNode(c, "paragraph"));

  if (type === "toggle") {
    const open = obj.open !== false;
    children = children.filter((c) => SlateElement.isElement(c));
    if (children.length === 0) {
      children = [{ type: "paragraph", children: [{ text: "" }] }];
    }
    return { type: "toggle", open, children } as Descendant;
  }

  if (children.length === 0) {
    const base: Record<string, unknown> = {
      type,
      children: [{ text: "" }],
    };
    if (type === "todo") {
      base.checked =
        typeof obj.checked === "boolean" ? obj.checked : false;
    }
    if (type === "code") {
      base.language = normalizeCodeLanguage(
        typeof obj.language === "string" ? obj.language : undefined,
      );
    }
    return base as Descendant;
  }

  const out: Record<string, unknown> = { type, children };
  if (type === "todo") {
    out.checked =
      typeof obj.checked === "boolean" ? obj.checked : false;
  }
  if (type === "code") {
    out.language = normalizeCodeLanguage(
      typeof obj.language === "string" ? obj.language : undefined,
    );
  }

  return out as Descendant;
}

function blockToDescendant(block: Block): Descendant {
  const content = block.content as unknown;
  let raw: unknown;
  if (Array.isArray(content)) {
    raw = content[0] ?? { type: block.type, children: [{ text: "" }] };
  } else if (content && typeof content === "object" && "type" in content) {
    raw = content;
  } else {
    raw = { type: block.type, children: [{ text: "" }] };
  }
  if (Text.isText(raw)) {
    const t = (raw as { text?: unknown }).text;
    raw = {
      type: "paragraph",
      children: [{ text: typeof t === "string" ? t : "" }],
    };
  }
  return repairNode(raw, block.type);
}

export function blocksToSlateValue(blocks: Block[]): Descendant[] {
  if (!blocks?.length) {
    return [{ type: "paragraph", children: [{ text: "" }] }];
  }
  const nodes = blocks.map(blockToDescendant);
  return nodes.length > 0
    ? nodes
    : [{ type: "paragraph", children: [{ text: "" }] }];
}
