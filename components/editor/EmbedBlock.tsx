"use client";

import { Plug } from "lucide-react";
import { Transforms, type Path } from "slate";
import { useSlate, type RenderElementProps } from "slate-react";
import { resolveEmbed } from "@/lib/editor/rich-blocks";
import {
  blockFieldClass,
  useBlockPath,
  VoidBlockFrame,
  VoidSlateChildren,
} from "./VoidBlockFrame";

function EmbedBody({
  element,
  children,
}: Pick<RenderElementProps, "element" | "children">) {
  const editor = useSlate();
  const path = useBlockPath(element);
  const url = typeof element.url === "string" ? element.url : "";
  const resolved = resolveEmbed(url);

  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div contentEditable={false} className="space-y-3 p-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          URL à intégrer
          <input
            type="url"
            placeholder="YouTube, Spotify, Figma, Google Docs, Maps, Loom, CodePen…"
            value={url}
            onChange={(event) => {
              if (!path) return;
              Transforms.setNodes(editor, { url: event.target.value } as object, {
                at: path,
              });
            }}
            className={blockFieldClass}
          />
        </label>
        {resolved?.kind === "iframe" ? (
          <div className="overflow-hidden rounded-md border border-border bg-muted/20">
            <iframe
              title={resolved.title}
              src={resolved.src}
              className="h-72 w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : null}
        {resolved?.kind === "link" ? (
          <a
            href={resolved.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm font-medium text-primary hover:bg-muted/40"
          >
            <Plug className="h-4 w-4" aria-hidden />
            Ouvrir {resolved.title}
          </a>
        ) : null}
        {!url.trim() ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-muted/10 py-8 text-center text-sm text-muted-foreground">
            <Plug className="h-8 w-8 opacity-50" aria-hidden />
            Colle un lien de service pour l’afficher ici.
          </div>
        ) : null}
      </div>
      <VoidSlateChildren>{children}</VoidSlateChildren>
    </div>
  );
}

export default function EmbedBlock({
  attributes,
  children,
  element,
  gutter,
  rootDropPath,
}: RenderElementProps & {
  gutter?: React.ReactNode;
  rootDropPath?: Path;
}) {
  return (
    <VoidBlockFrame
      attributes={attributes}
      gutter={gutter}
      rootDropPath={rootDropPath}
    >
      <EmbedBody element={element}>{children}</EmbedBody>
    </VoidBlockFrame>
  );
}
