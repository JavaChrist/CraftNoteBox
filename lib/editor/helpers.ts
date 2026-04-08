import {
  Editor,
  Element as SlateElement,
  Node,
  Path,
  Point,
  Range,
  type Editor as EditorType,
} from "slate";

export function isTopLevelBlockPath(path: Path): boolean {
  return path.length === 1;
}

/** Bloc racine (niveau document), pas un paragraphe imbriqué dans un toggle. */
export function getRootBlockEntry(editor: EditorType) {
  const { selection } = editor;
  if (!selection) return null;
  return Editor.above(editor, {
    at: selection,
    match: (n, p) =>
      SlateElement.isElement(n) &&
      Editor.isBlock(editor, n) &&
      p.length === 1,
  });
}

export function isBlockEmpty(editor: EditorType, path: Path): boolean {
  const node = Node.get(editor, path);
  if (!SlateElement.isElement(node)) return false;
  return Editor.isEmpty(editor, node);
}

export function isAtBlockStart(
  editor: EditorType,
  path: Path,
  selection: Range,
): boolean {
  if (!Range.isCollapsed(selection)) return false;
  const start = Editor.start(editor, path);
  return Point.equals(selection.anchor, start);
}

/** Indice affiché pour une liste numérotée (repart à 1 après un autre type de bloc). */
export function numberedListIndex(editor: EditorType, blockPath: Path): number {
  if (blockPath.length !== 1) return 1;
  const idx = blockPath[0];
  let n = 1;
  for (let i = 0; i < idx; i++) {
    const child = editor.children[i];
    if (SlateElement.isElement(child) && child.type === "numbered_list") {
      n += 1;
    }
  }
  return n;
}

export function parentIsToggle(editor: EditorType, path: Path): boolean {
  if (path.length < 2) return false;
  try {
    const parent = Node.parent(editor, path);
    return SlateElement.isElement(parent) && parent.type === "toggle";
  } catch {
    return false;
  }
}

export function toggleChildIndex(path: Path): number | null {
  if (path.length < 2 || path[0] === undefined || path[1] === undefined) {
    return null;
  }
  return path[1];
}
