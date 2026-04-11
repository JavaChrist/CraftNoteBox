import type { Descendant } from "slate";
import {
  DEFAULT_CODE_LANGUAGE,
  normalizeCodeLanguage,
} from "@/lib/editor/code-languages";

function languageFromFenceHint(hint: string): string {
  const h = hint.trim().toLowerCase();
  if (!h) return DEFAULT_CODE_LANGUAGE;
  const aliases: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    rb: "ruby",
    sh: "bash",
    shell: "bash",
    bash: "bash",
    yml: "yaml",
    md: "markdown",
  };
  return normalizeCodeLanguage(aliases[h] ?? h);
}

/**
 * Convertit une réponse IA (lignes type Markdown léger) en nœuds racine Slate.
 * Règles MVP : # / ## / ### , - [ ] / [] , - puces, ``` code ``` , sinon paragraphe.
 */
export function parseAiTextToSlateNodes(raw: string): Descendant[] {
  const text = raw.replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const out: Descendant[] = [];
  let i = 0;
  const codeLines: string[] = [];
  let inCode = false;
  let pendingCodeLang = DEFAULT_CODE_LANGUAGE;

  function flushCode() {
    if (codeLines.length === 0) return;
    out.push({
      type: "code",
      language: pendingCodeLang,
      children: [{ text: codeLines.join("\n") }],
    } as Descendant);
    codeLines.length = 0;
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmedEnd = line.trimEnd();
    const t = trimmedEnd.trimStart();

    if (t.startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        inCode = true;
        pendingCodeLang = languageFromFenceHint(t.slice(3));
      }
      i++;
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      i++;
      continue;
    }

    if (t === "") {
      i++;
      continue;
    }

    // Titres (ordre long → court)
    if (t.startsWith("### ")) {
      out.push({
        type: "heading3",
        children: [{ text: t.slice(4).trim() }],
      } as Descendant);
    } else if (t.startsWith("## ")) {
      out.push({
        type: "heading2",
        children: [{ text: t.slice(3).trim() }],
      } as Descendant);
    } else if (t.startsWith("# ") && !t.startsWith("##")) {
      out.push({
        type: "heading1",
        children: [{ text: t.slice(2).trim() }],
      } as Descendant);
    }
    // Todo : - [ ] … / - [x] … / [] …
    else if (/^-\s*\[\s*[xX]?\s*\]\s*/.test(t) || /^\[\s*[xX]?\s*\]\s+/.test(t)) {
      let checked = false;
      let body = "";
      const mDash = t.match(/^-\s*\[\s*([xX]?)\s*\]\s*(.*)$/);
      const mBare = t.match(/^\[\s*([xX]?)\s*\]\s+(.*)$/);
      const m = mDash || mBare;
      if (m) {
        checked = (m[1] ?? "").toLowerCase() === "x";
        body = (m[2] ?? "").trim();
      }
      out.push({
        type: "todo",
        checked,
        children: [{ text: body || "" }],
      } as Descendant);
    }
    // Puce simple (pas une case à cocher)
    else if (t.startsWith("- ") && !t.startsWith("- [")) {
      out.push({
        type: "bulleted_list",
        children: [{ text: t.slice(2).trim() }],
      } as Descendant);
    }
    else {
      out.push({
        type: "paragraph",
        children: [{ text: t }],
      } as Descendant);
    }

    i++;
  }

  if (inCode) flushCode();

  if (out.length === 0) {
    return [{ type: "paragraph", children: [{ text: "" }] } as Descendant];
  }

  return out;
}

/** Fallback : une ligne = un paragraphe (si parsing échoue côté appelant). */
export function plainLinesToParagraphs(text: string): Descendant[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [{ type: "paragraph", children: [{ text: "" }] } as Descendant];
  }
  return normalized.split("\n").map(
    (line) =>
      ({
        type: "paragraph",
        children: [{ text: line }],
      }) as Descendant,
  );
}
