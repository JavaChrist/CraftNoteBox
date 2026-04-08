import {
  Editor,
  Element as SlateElement,
  Node,
  type Path,
  type Editor as EditorType,
} from "slate";

/**
 * Chemin d’un élément sans passer par ReactEditor.findPath (évite les erreurs
 * au premier rendu si les WeakMaps Slate ne sont pas encore peuplées).
 */
export function findElementPathInEditor(
  editor: EditorType,
  target: SlateElement,
): Path | null {
  function walk(parent: Node, path: Path): Path | null {
    if (!SlateElement.isElement(parent) && !Editor.isEditor(parent)) {
      return null;
    }
    const children =
      Editor.isEditor(parent) || SlateElement.isElement(parent)
        ? parent.children
        : [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (SlateElement.isElement(child)) {
        if (child === target) {
          return [...path, i];
        }
        const found = walk(child, [...path, i]);
        if (found) return found;
      }
    }
    return null;
  }
  return walk(editor, []);
}
