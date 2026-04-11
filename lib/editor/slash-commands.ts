import {
  Editor,
  Element as SlateElement,
  Node,
  Path,
  Transforms,
  type Editor as EditorType,
  type Point,
} from "slate";
import type { BlockType } from "@/types/block";
import {
  buildSlashMenuRows,
  type SlashMenuRow,
} from "@/lib/editor/slash-menu-catalog";
import { setBlockTypeFromSlash } from "@/lib/editor/transforms";

export type SlashMenuState = {
  /** Ouverture via le bouton « + » (pas de texte « / » à supprimer). */
  source: "button";
  blockPath: Path;
  slashPoint: Point;
  queryEnd: Point;
  filter: string;
  rows: SlashMenuRow[];
  /** Indices dans `rows` des lignes actionnables (blocs réels). */
  selectableRowIndices: number[];
};

export type { SlashMenuRow };

/**
 * Ouvre le menu blocs depuis le bouton « + » (curseur au début du bloc, aucun « / » dans le texte).
 */
export function createSlashMenuStateFromButton(
  editor: EditorType,
  blockPath: Path,
  filter: string,
): SlashMenuState | null {
  let node: Node;
  try {
    node = Node.get(editor, blockPath);
  } catch {
    return null;
  }
  if (!SlateElement.isElement(node) || !Editor.isBlock(editor, node)) {
    return null;
  }

  const slashPoint = Editor.start(editor, blockPath);
  const { rows, selectableRowIndices } = buildSlashMenuRows(filter);

  return {
    source: "button",
    blockPath,
    slashPoint,
    queryEnd: slashPoint,
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

  try {
    Node.get(editor, blockPath);
  } catch {
    return;
  }

  Transforms.select(editor, {
    anchor: slashPoint,
    focus: queryEnd,
  });
  Transforms.delete(editor);

  setBlockTypeFromSlash(editor, blockPath, blockType);
}

/** Fermeture du menu sans supprimer de texte (le « / » n’est plus utilisé). */
export function dismissSlashText(_editor: EditorType, _state: SlashMenuState): void {}
