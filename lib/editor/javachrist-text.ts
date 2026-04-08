import {
  Editor,
  Element as SlateElement,
  Node,
  Path,
  Range,
  type Descendant,
  type Point,
} from "slate";
import type { AiSelectionMode } from "@/lib/ai/types";
import { parseAiTextToSlateNodes } from "@/lib/ai/transform-result";

/** Texte brut de tout le document (blocs racine). */
export function getFullDocumentPlainText(editor: Editor): string {
  return editor.children.map((n) => Node.string(n)).join("\n");
}

/** Texte du bloc racine actif (path.length === 1). */
export function getCurrentRootBlockPlainText(editor: Editor): string | null {
  const { selection } = editor;
  if (!selection) return null;
  const block = Editor.above(editor, {
    at: selection.focus,
    match: (n, p) =>
      SlateElement.isElement(n) &&
      Editor.isBlock(editor, n) &&
      p.length === 1,
  });
  if (!block) return null;
  const [node] = block;
  return Node.string(node);
}

/** Point d’insertion : après le bloc racine courant, ou fin du document. */
export function getInsertPointAfterCurrentRootBlock(editor: Editor): Point {
  const { selection } = editor;
  if (!selection) {
    return Editor.end(editor, []);
  }
  const block = Editor.above(editor, {
    at: selection.focus,
    match: (n, p) =>
      SlateElement.isElement(n) &&
      Editor.isBlock(editor, n) &&
      p.length === 1,
  });
  if (!block) {
    return Editor.end(editor, []);
  }
  const [, path] = block;
  const next = Path.next(path);
  if (next[0] !== undefined && next[0] < editor.children.length) {
    return Editor.start(editor, next);
  }
  return Editor.end(editor, []);
}

/**
 * Source pour JavaChrist.
 * - Sélection étendue → texte sélectionné + remplacement possible.
 * - Sinon : page entière ou bloc courant selon `selectionMode`.
 */
export function getJavaChristSource(
  editor: Editor,
  selectionMode: AiSelectionMode = "auto",
): {
  text: string;
  hadExpandedSelection: boolean;
  replaceRange: Range | null;
  insertPoint: Point;
} {
  const { selection } = editor;

  if (selection && Range.isExpanded(selection)) {
    return {
      text: Editor.string(editor, selection),
      hadExpandedSelection: true,
      replaceRange: selection,
      insertPoint: Range.end(selection),
    };
  }

  let text: string;
  if (selectionMode === "current_block") {
    const blockText = getCurrentRootBlockPlainText(editor);
    text = blockText ?? getFullDocumentPlainText(editor);
  } else {
    text = getFullDocumentPlainText(editor);
  }

  const insertPoint =
    selectionMode === "full_page" || selectionMode === "auto"
      ? getInsertPointAfterCurrentRootBlock(editor)
      : selection
        ? Range.end(selection)
        : Editor.end(editor, []);

  return {
    text,
    hadExpandedSelection: false,
    replaceRange: null,
    insertPoint,
  };
}

export function aiResultToNodes(text: string): Descendant[] {
  return parseAiTextToSlateNodes(text);
}
