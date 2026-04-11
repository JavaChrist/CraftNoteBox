import type { Content, Element as HastElement, Root, Text as HastText } from "hast";
import {
  Element as SlateElement,
  Node,
  Text,
  type BaseRange,
  type Path,
} from "slate";
import { codeLowlight } from "@/lib/editor/code-lowlight";
import { normalizeCodeLanguage } from "@/lib/editor/code-languages";

type Segment = { from: number; to: number; className: string };

function classNameFromProps(
  props: HastElement["properties"] | undefined,
): string {
  if (!props) return "";
  const c = props.className;
  if (Array.isArray(c)) return c.filter(Boolean).join(" ");
  if (typeof c === "string") return c;
  return "";
}

/** Parcourt le HAST lowlight et produit des segments [from,to) avec classes hljs. */
function hastToSegments(root: Root): Segment[] {
  const segments: Segment[] = [];
  let offset = 0;

  function emitText(value: string, stack: string[]): void {
    const len = value.length;
    if (len === 0) return;
    const cls = stack.filter(Boolean).join(" ") || "hljs";
    segments.push({ from: offset, to: offset + len, className: cls });
    offset += len;
  }

  function walk(node: Content, stack: string[]): void {
    if (node.type === "text") {
      emitText((node as HastText).value, stack);
      return;
    }
    if (node.type === "element") {
      const el = node as HastElement;
      const cls = classNameFromProps(el.properties);
      const next = cls ? [...stack, cls] : stack;
      for (const c of el.children) walk(c, next);
      return;
    }
  }

  for (const c of root.children) walk(c, []);
  return segments;
}

function buildTextParts(block: SlateElement): { path: Path; start: number; len: number }[] {
  const parts: { path: Path; start: number; len: number }[] = [];
  let o = 0;
  for (const [t, p] of Node.texts(block)) {
    if (!Text.isText(t)) continue;
    const len = t.text.length;
    parts.push({ path: p, start: o, len });
    o += len;
  }
  return parts;
}

function offsetToPoint(
  blockPath: Path,
  parts: { path: Path; start: number; len: number }[],
  globalOffset: number,
): { path: Path; offset: number } | null {
  for (const p of parts) {
    const end = p.start + p.len;
    if (globalOffset >= p.start && globalOffset <= end) {
      return {
        path: blockPath.concat(p.path),
        offset: Math.min(globalOffset - p.start, p.len),
      };
    }
  }
  return null;
}

/**
 * Décorations surlignage pour un bloc `code` (paths relatifs au document).
 */
export function decorationsForCodeBlock(
  block: SlateElement,
  blockPath: Path,
): BaseRange[] {
  if (!SlateElement.isElement(block) || block.type !== "code") return [];

  const text = Node.string(block);
  const lang = normalizeCodeLanguage(
    typeof (block as { language?: string }).language === "string"
      ? (block as { language: string }).language
      : undefined,
  );

  const parts = buildTextParts(block);
  if (parts.length === 0) return [];

  const total = text.length;
  if (total === 0) {
    return [];
  }

  const toRange = (from: number, to: number, className: string): BaseRange | null => {
    const a = offsetToPoint(blockPath, parts, from);
    const f = offsetToPoint(blockPath, parts, to);
    if (!a || !f) return null;
    return {
      anchor: a,
      focus: f,
      hljsClass: className,
    } as BaseRange;
  };

  if (lang === "plain") {
    const r = toRange(0, total, "hljs");
    return r ? [r] : [];
  }

  let root: Root;
  try {
    root = codeLowlight.highlight(lang, text);
  } catch {
    try {
      root = codeLowlight.highlightAuto(text);
    } catch {
      const r = toRange(0, total, "hljs");
      return r ? [r] : [];
    }
  }

  const segments = hastToSegments(root);
  if (segments.length === 0) {
    const r = toRange(0, total, "hljs");
    return r ? [r] : [];
  }

  const ranges: BaseRange[] = [];
  for (const seg of segments) {
    const from = Math.max(0, Math.min(seg.from, total));
    const to = Math.max(from, Math.min(seg.to, total));
    if (to <= from) continue;
    const r = toRange(from, to, seg.className);
    if (r) ranges.push(r);
  }

  return ranges;
}
