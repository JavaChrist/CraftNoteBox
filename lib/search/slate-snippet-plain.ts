/**
 * Extrait un texte lisible depuis un extrait de bloc Slate stocké en JSON (recherche SQL).
 */

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function extractFromNode(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node !== "object") return "";
  if (Array.isArray(node)) {
    return node.map(extractFromNode).filter(Boolean).join(" ");
  }
  const n = node as Record<string, unknown>;
  if (typeof n.text === "string") return n.text;
  if (Array.isArray(n.children)) {
    return n.children.map(extractFromNode).filter(Boolean).join("");
  }
  return "";
}

/** Si le JSON est tronqué, tente quand même de récupérer les champs "text". */
function fallbackExtractQuotedText(raw: string): string {
  const parts: string[] = [];
  const re = /"text"\s*:\s*"((?:\\.|[^"\\])*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    try {
      parts.push(JSON.parse(`"${m[1]}"`));
    } catch {
      parts.push(m[1].replace(/\\"/g, '"').replace(/\\n/g, "\n"));
    }
  }
  return collapseWhitespace(parts.join(" "));
}

export function slateSnippetToPlainText(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const looksJson =
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    trimmed.includes('"type"') ||
    trimmed.includes('"children"');

  if (!looksJson) {
    return collapseWhitespace(trimmed);
  }

  try {
    const parsed = JSON.parse(trimmed);
    const text = extractFromNode(parsed);
    const out = collapseWhitespace(text);
    if (out.length > 0) return out;
  } catch {
    /* JSON tronqué ou invalide */
  }

  const fallback = fallbackExtractQuotedText(trimmed);
  return fallback.length > 0 ? fallback : "";
}
