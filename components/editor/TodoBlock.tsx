"use client";

import { Transforms } from "slate";
import { useSlate } from "slate-react";
import type { RenderElementProps } from "slate-react";
import { findElementPathInEditor } from "@/lib/editor/find-element-path";

export default function TodoBlock({
  attributes,
  children,
  element,
}: RenderElementProps) {
  const editor = useSlate();
  const path = findElementPathInEditor(editor, element);
  const checked = !!element.checked;

  return (
    <div {...attributes} className="flex items-start gap-2 py-0.5">
      <span contentEditable={false} className="pt-1">
        <input
          type="checkbox"
          checked={checked}
          className="h-4 w-4 cursor-pointer accent-primary"
          aria-label="Tâche terminée"
          onMouseDown={(e) => e.preventDefault()}
          onChange={() => {
            if (!path) return;
            Transforms.setNodes(editor, { checked: !checked } as object, {
              at: path,
            });
          }}
        />
      </span>
      <div className="min-w-0 flex-1 leading-7">{children}</div>
    </div>
  );
}
