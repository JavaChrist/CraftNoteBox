import {
  Editor,
  Element as SlateElement,
  Node,
  Path,
  Point,
  Range,
  Transforms,
  type Editor as EditorType,
} from "slate";
import type { BlockType } from "@/types/block";
import { createDefaultBlock } from "@/lib/blocks/schema";
import { VOID_BLOCK_TYPES } from "@/lib/editor/block-types";

const DEMOTE_AT_START_TYPES = new Set<string>([
  "heading1",
  "heading2",
  "heading3",
  "bulleted_list",
  "numbered_list",
  "todo",
  "quote",
  "code",
]);

function blockIsEmpty(editor: EditorType, path: Path): boolean {
  const node = Node.get(editor, path);
  if (!SlateElement.isElement(node)) return false;
  return Editor.isEmpty(editor, node);
}

/**
 * Applique un type de bloc après suppression du « /… » (création ou transformation).
 */
export function setBlockTypeFromSlash(
  editor: EditorType,
  blockPath: Path,
  blockType: BlockType,
): void {
  if (VOID_BLOCK_TYPES.has(blockType)) {
    Transforms.removeNodes(editor, { at: blockPath });
    Transforms.insertNodes(
      editor,
      [
        createDefaultBlock("divider") as Node,
        { type: "paragraph", children: [{ text: "" }] } as Node,
      ],
      { at: blockPath },
    );
    Transforms.select(editor, Editor.start(editor, Path.next(blockPath)));
    return;
  }

  const current = Node.get(editor, blockPath);
  const preservedText = SlateElement.isElement(current)
    ? Node.string(current)
    : "";

  if (blockType === "toggle") {
    Transforms.setNodes(
      editor,
      {
        type: "toggle",
        open: true,
        children: [
          { type: "paragraph", children: [{ text: preservedText }] },
        ],
      } as object,
      { at: blockPath },
    );
    Transforms.select(editor, Editor.end(editor, blockPath.concat(0)));
    return;
  }

  Transforms.setNodes(editor, { type: blockType } as object, {
    at: blockPath,
  });

  if (blockType === "todo") {
    Transforms.setNodes(editor, { checked: false } as object, {
      at: blockPath,
    });
  } else {
    Transforms.unsetNodes(editor, "checked", { at: blockPath });
  }
  Transforms.unsetNodes(editor, "open", { at: blockPath });

  Transforms.select(editor, Editor.end(editor, blockPath));
}

/**
 * Comportements Enter / Backspace / voids pour blocs racine type Notion (MVP).
 */
export function withBlockEditor<T extends EditorType>(editor: T): T {
  const { insertBreak, deleteBackward, normalizeNode, isVoid } = editor;

  editor.isVoid = (element) => {
    if (SlateElement.isElement(element) && element.type === "divider") {
      return true;
    }
    return isVoid(element);
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;
    if (SlateElement.isElement(node) && !Editor.isEditor(node)) {
      if (node.type === "todo" && node.checked === undefined) {
        Transforms.setNodes(editor, { checked: false } as object, { at: path });
        return;
      }
      if (node.type === "toggle") {
        if (node.open === undefined) {
          Transforms.setNodes(editor, { open: true } as object, { at: path });
          return;
        }
        const first = node.children[0];
        if (!first || !SlateElement.isElement(first)) {
          Transforms.insertNodes(
            editor,
            { type: "paragraph", children: [{ text: "" }] } as Node,
            { at: path.concat(0) },
          );
          return;
        }
      }
    }
    normalizeNode(entry);
  };

  editor.insertBreak = () => {
    const { selection } = editor;
    if (!selection) {
      insertBreak();
      return;
    }

    const block = Editor.above(editor, {
      match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
    });
    if (!block) {
      insertBreak();
      return;
    }

    const [el, path] = block;

    if (SlateElement.isElement(el) && el.type === "divider") {
      const next = Path.next(path);
      Transforms.insertNodes(
        editor,
        { type: "paragraph", children: [{ text: "" }] } as Node,
        { at: next },
      );
      Transforms.select(editor, Editor.start(editor, next));
      return;
    }

    if (SlateElement.isElement(el) && el.type === "code") {
      Transforms.insertText(editor, "\n");
      return;
    }

    const parentEntry = Editor.parent(editor, path);
    const [parentNode, parentPath] = parentEntry;
    if (
      SlateElement.isElement(parentNode) &&
      parentNode.type === "toggle" &&
      parentNode.children.length > 1 &&
      Range.isCollapsed(selection)
    ) {
      const childIndex = path[path.length - 1];
      const isLastChild = childIndex === parentNode.children.length - 1;
      const atEnd = Editor.isEnd(editor, selection.anchor, path);
      const empty = blockIsEmpty(editor, path);
      if (
        isLastChild &&
        atEnd &&
        empty &&
        SlateElement.isElement(el) &&
        el.type === "paragraph"
      ) {
        Transforms.removeNodes(editor, { at: path });
        const afterToggle = Path.next(parentPath);
        Transforms.insertNodes(
          editor,
          { type: "paragraph", children: [{ text: "" }] } as Node,
          { at: afterToggle },
        );
        Transforms.select(editor, Editor.start(editor, afterToggle));
        return;
      }
    }

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    const { selection } = editor;
    if (!selection || !Range.isCollapsed(selection)) {
      deleteBackward(unit);
      return;
    }

    const block = Editor.above(editor, {
      match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
    });
    if (!block) {
      deleteBackward(unit);
      return;
    }

    const [el, path] = block;
    const start = Editor.start(editor, path);

    if (SlateElement.isElement(el) && el.type === "divider") {
      Transforms.removeNodes(editor, { at: path });
      return;
    }

    if (!Point.equals(selection.anchor, start)) {
      deleteBackward(unit);
      return;
    }

    if (blockIsEmpty(editor, path)) {
      if (path.length === 1) {
        if (editor.children.length <= 1) {
          deleteBackward(unit);
          return;
        }
        Transforms.removeNodes(editor, { at: path });
        Transforms.select(editor, Editor.end(editor, Path.previous(path)));
        return;
      }

      const parentPath = Path.parent(path);
      const parent = Node.get(editor, parentPath);
      if (SlateElement.isElement(parent) && parent.type === "toggle") {
        if (parent.children.length <= 1) {
          Transforms.removeNodes(editor, { at: parentPath });
          if (parentPath[0] > 0) {
            Transforms.select(
              editor,
              Editor.end(editor, Path.previous(parentPath)),
            );
          } else {
            Transforms.select(editor, Editor.start(editor, [0]));
          }
        } else {
          Transforms.removeNodes(editor, { at: path });
          Transforms.select(editor, Editor.end(editor, Path.previous(path)));
        }
        return;
      }

      deleteBackward(unit);
      return;
    }

    if (SlateElement.isElement(el) && DEMOTE_AT_START_TYPES.has(el.type)) {
      Transforms.setNodes(editor, { type: "paragraph" } as object, {
        at: path,
      });
      Transforms.unsetNodes(editor, "checked", { at: path });
      Transforms.unsetNodes(editor, "open", { at: path });
      return;
    }

    deleteBackward(unit);
  };

  return editor;
}
