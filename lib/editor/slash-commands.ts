import {
  Editor,
  Element as SlateElement,
  Node,
  Path,
  Point,
  Range,
  Text,
  Transforms,
  type Editor as EditorType,
} from "slate";
import type { BlockType } from "@/types/block";
import {
  buildSlashMenuRows,
  type SlashMenuRow,
} from "@/lib/editor/slash-menu-catalog";
import { setBlockTypeFromSlash } from "@/lib/editor/transforms";

export type SlashMenuState = {
  blockPath: Path;
  slashPoint: Point;
  queryEnd: Point;
  filter: string;
  rows: SlashMenuRow[];
  /** Indices dans `rows` des lignes actionnables (blocs réels). */
  selectableRowIndices: number[];
};

export type { SlashMenuRow };

function pointAtBlockCharOffset(
  editor: EditorType,
  blockPath: Path,
  charOffset: number,
): Point | null {
  const block = Node.get(editor, blockPath);
  if (!SlateElement.isElement(block)) return null;

  let acc = 0;
  for (const [textNode, path] of Node.texts(block)) {
    if (!Text.isText(textNode)) continue;
    const len = textNode.text.length;
    if (acc + len >= charOffset) {
      return { path: blockPath.concat(path), offset: charOffset - acc };
    }
    acc += len;
  }

  if (charOffset === acc) {
    const end = Editor.end(editor, blockPath);
    return end;
  }

  return null;
}

/**
 * Détecte un motif `/` + filtre optionnel en fin de bloc (début de bloc ou après un espace).
 */
export function computeSlashMenuState(editor: EditorType): SlashMenuState | null {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) return null;

  const blockEntry = Editor.above(editor, {
    match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
  });
  if (!blockEntry) return null;

  const [, blockPath] = blockEntry;
  const start = Editor.start(editor, blockPath);
  const beforeRange = { anchor: start, focus: selection.anchor };

  if (Range.isBackward(beforeRange)) return null;

  const beforeText = Editor.string(editor, beforeRange);
  const m = beforeText.match(/(?:^|\s)\/([^\s/]*)$/);
  if (!m) return null;

  const filter = m[1] ?? "";
  const slashIndex = beforeText.lastIndexOf("/");
  if (slashIndex < 0) return null;

  const slashPoint = pointAtBlockCharOffset(editor, blockPath, slashIndex);
  if (!slashPoint) return null;

  const { rows, selectableRowIndices } = buildSlashMenuRows(filter);
  if (rows.length === 0) return null;

  return {
    blockPath,
    slashPoint,
    queryEnd: selection.anchor,
    filter,
    rows,
    selectableRowIndices,
  };
}

export function applySlashCommand(
  editor: EditorType,
  state: SlashMenuState,
  blockType: BlockType,
): void {
  const { blockPath, slashPoint, queryEnd } = state;

  Transforms.select(editor, {
    anchor: slashPoint,
    focus: queryEnd,
  });
  Transforms.delete(editor);

  setBlockTypeFromSlash(editor, blockPath, blockType);
}

export function dismissSlashText(editor: EditorType, state: SlashMenuState): void {
  const { slashPoint, queryEnd } = state;
  Transforms.select(editor, { anchor: slashPoint, focus: queryEnd });
  Transforms.delete(editor);
}
