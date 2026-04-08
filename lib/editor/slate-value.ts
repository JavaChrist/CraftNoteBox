import { Element as SlateElement, Text, type Descendant } from "slate";
import type { Block } from "@/lib/db/types";
import type { BlockType } from "@/types/block";

const VOID_TYPES = new Set<BlockType>(["divider"]);

/**
 * Garantit un arbre Slate valide (chaque bloc a au moins une feuille texte).
 * Évite l’erreur « no start text node » avec des JSON partiels ou vides en base.
 */
function repairNode(raw: unknown, fallbackBlockType: BlockType): Descendant {
  if (Text.isText(raw)) {
    const t = (raw as { text?: unknown }).text;
    return { text: typeof t === "string" ? t : "" };
  }

  if (!raw || typeof raw !== "object") {
    return { type: "paragraph", children: [{ text: "" }] };
  }

  const obj = raw as Record<string, unknown>;
  const type: BlockType =
    typeof obj.type === "string" ? (obj.type as BlockType) : fallbackBlockType;

  if (VOID_TYPES.has(type)) {
    return { type, children: [{ text: "" }] } as Descendant;
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
    return base as Descendant;
  }

  const out: Record<string, unknown> = { type, children };
  if (type === "todo") {
    out.checked =
      typeof obj.checked === "boolean" ? obj.checked : false;
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
