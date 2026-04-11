"use client";

import { GripVertical, Palette, Plus, Trash2 } from "lucide-react";
import type { Path } from "slate";
import { ReactEditor, useSlate } from "slate-react";
import type { RenderElementProps } from "slate-react";
import { removeRootBlock } from "@/lib/editor/transforms";
import { ROOT_BLOCK_DND_MIME } from "@/lib/editor/move-root-block";
import { useEditorBlockChrome } from "./editor-block-chrome-context";

type Props = {
  blockPath: Path;
  element: RenderElementProps["element"];
};

export default function BlockGutter({ blockPath, element }: Props) {
  const editor = useSlate();
  const chrome = useEditorBlockChrome();

  return (
    <div
      contentEditable={false}
      className="flex h-7 w-[5.75rem] shrink-0 select-none items-center justify-end gap-0.5 text-muted-foreground md:w-[6.25rem]"
      data-block-gutter=""
    >
      <button
        type="button"
        title="Insérer un bloc"
        aria-label="Menu des blocs"
        className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => chrome?.openSlashMenu(element)}
      >
        <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
      <button
        type="button"
        title="Couleur du texte du bloc"
        aria-label="Palette de couleur"
        className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) =>
          chrome?.openColorPopover(element, e.currentTarget)
        }
      >
        <Palette className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </button>
      <button
        type="button"
        title="Supprimer ce bloc"
        aria-label="Supprimer ce bloc"
        className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          try {
            const p = ReactEditor.findPath(editor as ReactEditor, element);
            if (p.length !== 1) return;
            removeRootBlock(editor, p);
            ReactEditor.focus(editor as ReactEditor);
          } catch {
            /* ignore */
          }
        }}
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </button>
      <span
        draggable
        title="Déplacer le bloc"
        aria-label="Déplacer le bloc"
        className="flex h-7 w-5 cursor-grab items-center justify-center rounded text-muted-foreground/80 hover:bg-muted/60 active:cursor-grabbing"
        onDragStart={(e) => {
          let rootIndex = blockPath[0];
          try {
            const p = ReactEditor.findPath(editor as ReactEditor, element);
            if (typeof p[0] === "number") rootIndex = p[0];
          } catch {
            /* garder blockPath[0] */
          }
          e.dataTransfer.setData(ROOT_BLOCK_DND_MIME, String(rootIndex));
          e.dataTransfer.effectAllowed = "move";
        }}
      >
        <GripVertical className="h-4 w-4" strokeWidth={2} aria-hidden />
      </span>
    </div>
  );
}
