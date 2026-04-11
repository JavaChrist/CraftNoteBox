"use client";

import type { Path } from "slate";
import type { RenderElementProps } from "slate-react";
import { ROOT_BLOCK_DND_MIME } from "@/lib/editor/move-root-block";
import { useEditorBlockChrome } from "./editor-block-chrome-context";

type Props = {
  path: Path;
  attributes: RenderElementProps["attributes"];
  className?: string;
  children: React.ReactNode;
};

function hasDndType(dt: DataTransfer, mime: string): boolean {
  return [...dt.types].includes(mime);
}

export default function RootBlockRow({
  path,
  attributes,
  className,
  children,
}: Props) {
  const chrome = useEditorBlockChrome();
  const myIndex = path[0];
  if (typeof myIndex !== "number") {
    return (
      <div {...attributes} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div
      {...attributes}
      className={className}
      onDragOver={(e) => {
        if (!hasDndType(e.dataTransfer, ROOT_BLOCK_DND_MIME)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        if (!hasDndType(e.dataTransfer, ROOT_BLOCK_DND_MIME)) return;
        const raw = e.dataTransfer.getData(ROOT_BLOCK_DND_MIME);
        e.preventDefault();
        const from = Number.parseInt(raw, 10);
        if (!Number.isInteger(from) || from < 0) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const beforeIndex =
          e.clientY < rect.top + rect.height / 2 ? myIndex : myIndex + 1;
        chrome?.moveRootBlockBefore(from, beforeIndex);
      }}
    >
      {children}
    </div>
  );
}
