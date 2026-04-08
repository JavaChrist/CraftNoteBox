import { Editor, type Descendant } from "slate";

const MINIMAL: Descendant[] = [
  { type: "paragraph", children: [{ text: "" }] },
];

export function cloneSlateDocument(nodes: Descendant[]): Descendant[] {
  return JSON.parse(JSON.stringify(nodes)) as Descendant[];
}

/**
 * Si le document est vide ou illisible pour Editor.start(editor, []), réinjecte le fallback.
 * Retourne true si l’éditeur a été modifié (forcer un rerender React).
 */
export function ensureEditorDocumentValid(
  editor: Editor,
  fallback: Descendant[],
): boolean {
  try {
    if (!editor.children || editor.children.length === 0) {
      throw new Error("empty");
    }
    Editor.start(editor, []);
    return false;
  } catch {
    editor.children =
      fallback.length > 0 ? cloneSlateDocument(fallback) : cloneSlateDocument(MINIMAL);
    Editor.normalize(editor, { force: true });
    return true;
  }
}
