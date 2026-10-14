"use client";

import type { ReactNode } from "react";
import type { Path } from "slate";
import { ReactEditor, useSlate, type RenderElementProps } from "slate-react";
import RootBlockRow from "./RootBlockRow";

export const blockFieldClass =
  "w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

export const blockSelectClass =
  "cnb-select w-full rounded-md border border-input bg-background py-1.5 pl-2 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

export function useBlockPath(
  element: RenderElementProps["element"],
): Path | null {
  const editor = useSlate();
  try {
    return ReactEditor.findPath(editor as ReactEditor, element);
  } catch {
    return null;
  }
}

export function VoidSlateChildren({ children }: { children: ReactNode }) {
  return (
    <div
      className="h-0 max-h-0 overflow-hidden leading-none opacity-0"
      aria-hidden
    >
      {children}
    </div>
  );
}

export function VoidBlockFrame({
  attributes,
  gutter,
  rootDropPath,
  children,
}: {
  attributes: RenderElementProps["attributes"];
  gutter?: ReactNode;
  rootDropPath?: Path;
  children: ReactNode;
}) {
  if (gutter && rootDropPath && rootDropPath.length === 1) {
    return (
      <RootBlockRow
        path={rootDropPath}
        attributes={attributes}
        className="group flex items-start gap-0.5 py-0.5 md:gap-1"
      >
        {gutter}
        {children}
      </RootBlockRow>
    );
  }
  return (
    <div
      {...attributes}
      className="group flex items-start gap-0.5 py-0.5 md:gap-1"
    >
      {gutter}
      {children}
    </div>
  );
}
