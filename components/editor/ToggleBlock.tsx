"use client";

import {
  Editor,
  Element as SlateElement,
  Node,
  Path,
  Range,
  Transforms,
} from "slate";
import { ReactEditor, useSlate } from "slate-react";
import type { RenderElementProps } from "slate-react";

function readToggleOpen(node: Node): boolean {
  if (!SlateElement.isElement(node)) return true;
  const o = (node as { open?: boolean }).open;
  return o !== false;
}

export default function ToggleBlock({
  attributes,
  children,
  element,
}: RenderElementProps) {
  const editor = useSlate();

  let open = readToggleOpen(element);
  try {
    const p = ReactEditor.findPath(editor as ReactEditor, element);
    const n = Node.get(editor, p);
    open = readToggleOpen(n);
  } catch {
    /* garder open dérivé de element */
  }

  const handleChevronClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const path = ReactEditor.findPath(editor as ReactEditor, element);
      const current = Node.get(editor, path);
      const isOpen = readToggleOpen(current);
      const nextOpen = !isOpen;

      if (
        !nextOpen &&
        editor.selection &&
        Range.isCollapsed(editor.selection)
      ) {
        const anchor = editor.selection.anchor.path;
        if (Path.isAncestor(path, anchor)) {
          const childIdx = anchor[path.length];
          if (typeof childIdx === "number" && childIdx > 0) {
            const titlePath = path.concat(0);
            Transforms.select(editor, Editor.end(editor, titlePath));
          }
        }
      }

      Transforms.setNodes(editor, { open: nextOpen } as object, { at: path });
      ReactEditor.focus(editor as ReactEditor);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      {...attributes}
      className="my-2 rounded-md border border-transparent py-0.5"
    >
      <div className="flex items-start gap-2">
        <span contentEditable={false} className="select-none pt-0.5">
          <button
            type="button"
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-expanded={open}
            aria-label={open ? "Replier" : "Déplier"}
            onMouseDown={(ev) => ev.preventDefault()}
            onClick={handleChevronClick}
          >
            {open ? "▼" : "▶"}
          </button>
        </span>
        <div
          className={
            open
              ? "min-w-0 flex-1"
              : "min-w-0 flex-1 [&>*:not(:first-child)]:hidden"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
