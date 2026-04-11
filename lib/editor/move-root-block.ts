import {
  Editor,
  Element as SlateElement,
  Node,
  Transforms,
  type Editor as EditorType,
} from "slate";

/** Type MIME pour le glisser-déposer des blocs racine (indice dans `editor.children`). */
export const ROOT_BLOCK_DND_MIME = "application/x-craftnotebox-root-block";

/**
 * Déplace le bloc racine `fromIndex` pour qu’il se retrouve **avant** l’élément
 * qui est aujourd’hui à `beforeIndex` (0…n). `beforeIndex === n` = à la fin.
 */
export function moveRootBlockBefore(
  editor: EditorType,
  fromIndex: number,
  beforeIndex: number,
): boolean {
  const n = editor.children.length;
  if (n <= 1) return false;
  if (fromIndex < 0 || fromIndex >= n) return false;
  if (beforeIndex < 0 || beforeIndex > n) return false;
  if (beforeIndex === fromIndex) return false;
  if (beforeIndex === fromIndex + 1) return false;

  const at: [number] = [fromIndex];
  let node: Node;
  try {
    node = Node.get(editor, at);
  } catch {
    return false;
  }
  if (!SlateElement.isElement(node)) return false;

  Editor.withoutNormalizing(editor, () => {
    Transforms.removeNodes(editor, { at });
    const insertAt = beforeIndex > fromIndex ? beforeIndex - 1 : beforeIndex;
    Transforms.insertNodes(editor, node, { at: [insertAt] });
  });

  return true;
}
