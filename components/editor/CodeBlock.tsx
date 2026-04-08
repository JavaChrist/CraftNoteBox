"use client";

import type { RenderElementProps } from "slate-react";

export default function CodeBlock({ attributes, children }: RenderElementProps) {
  return (
    <pre
      {...attributes}
      className="my-2 overflow-x-auto rounded-md border border-border bg-zinc-950 px-3 py-2 font-mono text-[0.9rem] leading-relaxed text-zinc-100 dark:bg-zinc-950/90"
    >
      <code>{children}</code>
    </pre>
  );
}
