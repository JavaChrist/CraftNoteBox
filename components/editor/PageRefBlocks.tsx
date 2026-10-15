"use client";

import { ExternalLink, FileText, Link2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Transforms, type Path } from "slate";
import { useSlate, type RenderElementProps } from "slate-react";
import { listBlocks } from "@/lib/actions/blocks";
import { listPagesForMeetingPicker } from "@/lib/actions/meetings";
import type { PickablePage } from "@/lib/meetings/types";
import { PAGE_SCOPE_META } from "@/lib/pages/scopes";
import { useEditorBlockChrome } from "./editor-block-chrome-context";
import {
  blockSelectClass,
  useBlockPath,
  VoidBlockFrame,
  VoidSlateChildren,
} from "./VoidBlockFrame";

function textFromContent(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  if (Array.isArray(node)) {
    return node.map(textFromContent).filter(Boolean).join(" ");
  }
  const record = node as Record<string, unknown>;
  if (typeof record.text === "string" && record.text.trim()) return record.text;
  if (Array.isArray(record.children)) return textFromContent(record.children);
  return "";
}

function PagePicker({
  element,
  mode,
  children,
}: Pick<RenderElementProps, "element" | "children"> & {
  mode: "link" | "embed";
}) {
  const editor = useSlate();
  const chrome = useEditorBlockChrome();
  const path = useBlockPath(element);
  const pageId = typeof element.pageId === "string" ? element.pageId : "";
  const pageTitle = typeof element.pageTitle === "string" ? element.pageTitle : "";
  const [pages, setPages] = useState<PickablePage[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [excerpt, setExcerpt] = useState("");
  const [excerptError, setExcerptError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listPagesForMeetingPicker()
      .then((rows) => {
        if (!cancelled) setPages(rows);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Impossible de charger tes pages.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== "embed" || !pageId || pageId === chrome?.pageId) {
      setExcerpt("");
      return;
    }
    let cancelled = false;
    setExcerptError(null);
    listBlocks(pageId)
      .then((blocks) => {
        if (cancelled) return;
        const text = blocks
          .map((block) => textFromContent(block.content))
          .filter(Boolean)
          .join("\n")
          .replace(/\s+/g, " ")
          .trim();
        setExcerpt(text.slice(0, 420));
      })
      .catch(() => {
        if (!cancelled) setExcerptError("Aperçu indisponible.");
      });
    return () => {
      cancelled = true;
    };
  }, [mode, pageId, chrome?.pageId]);

  const onPick = (id: string) => {
    if (!path) return;
    const picked = pages?.find((page) => page.id === id);
    Transforms.setNodes(
      editor,
      {
        pageId: id,
        pageTitle: picked?.title ?? "",
      } as object,
      { at: path },
    );
  };

  const self = Boolean(pageId && pageId === chrome?.pageId);

  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div contentEditable={false} className="space-y-3 p-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {mode === "embed" ? "Page à afficher" : "Page liée"}
          <select
            className={blockSelectClass}
            value={pageId}
            disabled={!pages}
            onChange={(event) => onPick(event.target.value)}
          >
            <option value="">Choisir une page…</option>
            {(pages ?? []).map((page) => (
              <option key={page.id} value={page.id}>
                {page.title} ({PAGE_SCOPE_META[page.scope].shortLabel})
              </option>
            ))}
          </select>
        </label>
        {loadError ? (
          <p className="text-sm text-destructive" role="alert">
            {loadError}
          </p>
        ) : null}
        {pageId ? (
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex items-start gap-2">
              {mode === "embed" ? (
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              ) : (
                <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">
                  {pageTitle || "Sans titre"}
                </p>
                {self ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    C’est la page en cours d’édition.
                  </p>
                ) : null}
                {mode === "embed" && !self && excerpt ? (
                  <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">
                    {excerpt}
                  </p>
                ) : null}
                {mode === "embed" && !self && !excerpt && !excerptError ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cette page n’a pas encore de texte.
                  </p>
                ) : null}
                {excerptError ? (
                  <p className="mt-2 text-sm text-destructive" role="alert">
                    {excerptError}
                  </p>
                ) : null}
                {!self ? (
                  <Link
                    href={`/pages/${pageId}`}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Ouvrir la page
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {mode === "embed"
              ? "Choisis une page pour en afficher un aperçu ici."
              : "Choisis une page pour créer un lien interne."}
          </p>
        )}
      </div>
      <VoidSlateChildren>{children}</VoidSlateChildren>
    </div>
  );
}

function PageRefBlock({
  mode,
  attributes,
  children,
  element,
  gutter,
  rootDropPath,
}: RenderElementProps & {
  mode: "link" | "embed";
  gutter?: React.ReactNode;
  rootDropPath?: Path;
}) {
  return (
    <VoidBlockFrame
      attributes={attributes}
      gutter={gutter}
      rootDropPath={rootDropPath}
    >
      <PagePicker element={element} mode={mode}>
        {children}
      </PagePicker>
    </VoidBlockFrame>
  );
}

export function PageLinkBlock(
  props: RenderElementProps & {
    gutter?: React.ReactNode;
    rootDropPath?: Path;
  },
) {
  return <PageRefBlock {...props} mode="link" />;
}

export function PageEmbedBlock(
  props: RenderElementProps & {
    gutter?: React.ReactNode;
    rootDropPath?: Path;
  },
) {
  return <PageRefBlock {...props} mode="embed" />;
}
