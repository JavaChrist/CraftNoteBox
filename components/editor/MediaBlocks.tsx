"use client";

import {
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Editor, Transforms, type Path } from "slate";
import {
  ReactEditor,
  useSlate,
  type RenderElementProps,
} from "slate-react";
import RootBlockRow from "./RootBlockRow";
import { useEditorBlockChrome } from "./editor-block-chrome-context";
import { resizeImageFileForUpload } from "@/lib/media/resize-image-for-upload";
import {
  formatLimitBytes,
  MAX_FILE_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_BYTES,
  validateUploadFileSize,
} from "@/lib/media/upload-limits";
import { uploadPageAsset } from "@/lib/media/upload-page-asset";

function safeHostname(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

function looksLikeHttpUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  if (n < 1024) return `${Math.round(n)} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}

function selectAfterBlockRemoved(editor: Editor, removedPath: Path): void {
  const idx = removedPath[0];
  if (idx > 0) {
    try {
      Transforms.select(editor, Editor.end(editor, [idx - 1]));
      return;
    } catch {
      /* fallthrough */
    }
  }
  try {
    if (editor.children.length > 0) {
      Transforms.select(editor, Editor.start(editor, [0]));
    }
  } catch {
    /* ignore */
  }
}

function useBlockPath(element: RenderElementProps["element"]): Path | null {
  const editor = useSlate();
  try {
    return ReactEditor.findPath(editor as ReactEditor, element);
  } catch {
    return null;
  }
}

function VoidSlateChildren({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-0 max-h-0 overflow-hidden leading-none opacity-0"
      aria-hidden
    >
      {children}
    </div>
  );
}

function RemoveBlockButton({ path }: { path: Path }) {
  const editor = useSlate();
  return (
    <button
      type="button"
      title="Supprimer le bloc"
      className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        Transforms.removeNodes(editor, { at: path });
        selectAfterBlockRemoved(editor, path);
        ReactEditor.focus(editor as ReactEditor);
      }}
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

function ImageBlockBody({
  element,
  children,
}: Pick<RenderElementProps, "element" | "children">) {
  const editor = useSlate();
  const chrome = useEditorBlockChrome();
  const path = useBlockPath(element);
  const url = typeof element.url === "string" ? element.url : "";
  const alt = typeof element.alt === "string" ? element.alt : "";
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const pageId = chrome?.pageId ?? "";

  const patch = useCallback(
    (partial: Record<string, unknown>) => {
      if (!path) return;
      Transforms.setNodes(editor, partial as object, { at: path });
    },
    [editor, path],
  );

  const onPickFile = async (file: File | null) => {
    if (!file || !path || !pageId) {
      if (!pageId) setErr("Page introuvable pour l’import.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      let toUpload = file;
      if (file.type.startsWith("image/")) {
        toUpload = await resizeImageFileForUpload(file);
      }
      const sizeMsg = validateUploadFileSize(toUpload, "image");
      if (sizeMsg) {
        setErr(sizeMsg);
        return;
      }
      const r = await uploadPageAsset(pageId, toUpload, "image");
      if (!r.ok) {
        setErr(r.message);
        return;
      }
      patch({
        url: r.publicUrl,
        alt: toUpload.name.replace(/\.[^.]+$/i, "") || alt,
      });
    } finally {
      setBusy(false);
    }
  };

  if (!path) {
    return (
      <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
        Bloc image (erreur de chemin)
        <VoidSlateChildren>{children}</VoidSlateChildren>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div
        contentEditable={false}
        className="flex items-center justify-end gap-1 border-b border-border bg-muted/30 px-2 py-1"
      >
        <label className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-foreground hover:bg-muted">
          <Upload className="h-3.5 w-3.5" aria-hidden />
          Importer
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy || !pageId}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              e.target.value = "";
              void onPickFile(f);
            }}
          />
        </label>
        <RemoveBlockButton path={path} />
      </div>
      <div contentEditable={false} className="space-y-2 p-3">
        {busy ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Import…
          </p>
        ) : null}
        {err ? (
          <p className="text-sm text-destructive" role="alert">
            {err}
          </p>
        ) : null}
        <p className="text-[11px] text-muted-foreground">
          Import max {formatLimitBytes(MAX_IMAGE_UPLOAD_BYTES)} — les grosses photos
          sont réduites avant envoi.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
            URL de l’image
            <input
              type="url"
              placeholder="https://…"
              value={url}
              onChange={(e) => patch({ url: e.target.value })}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
            Texte alternatif
            <input
              type="text"
              value={alt}
              onChange={(e) => patch({ alt: e.target.value })}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>
        {url.trim() ? (
          <div className="overflow-hidden rounded-md border border-border bg-muted/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url.trim()}
              alt={alt || ""}
              className="max-h-[min(70vh,28rem)] w-full object-contain"
              loading="lazy"
              onLoad={() => setErr(null)}
              onError={() => setErr("Impossible d’afficher cette image (URL ou CORS).")}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/10 py-10 text-center text-sm text-muted-foreground">
            <ImageIcon className="h-8 w-8 opacity-50" aria-hidden />
            Colle une URL ou importe une image
          </div>
        )}
      </div>
      <VoidSlateChildren>{children}</VoidSlateChildren>
    </div>
  );
}

function FileBlockBody({
  element,
  children,
}: Pick<RenderElementProps, "element" | "children">) {
  const editor = useSlate();
  const chrome = useEditorBlockChrome();
  const path = useBlockPath(element);
  const url = typeof element.url === "string" ? element.url : "";
  const fileName =
    typeof element.fileName === "string" ? element.fileName : "";
  const sizeBytes =
    typeof element.sizeBytes === "number" ? element.sizeBytes : undefined;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const pageId = chrome?.pageId ?? "";

  const patch = useCallback(
    (partial: Record<string, unknown>) => {
      if (!path) return;
      Transforms.setNodes(editor, partial as object, { at: path });
    },
    [editor, path],
  );

  const onPickFile = async (file: File | null) => {
    if (!file || !path || !pageId) {
      if (!pageId) setErr("Page introuvable pour l’import.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const sizeMsg = validateUploadFileSize(file, "file");
      if (sizeMsg) {
        setErr(sizeMsg);
        return;
      }
      const r = await uploadPageAsset(pageId, file, "file");
      if (!r.ok) {
        setErr(r.message);
        return;
      }
      patch({
        url: r.publicUrl,
        fileName: file.name,
        mimeType: file.type || undefined,
        sizeBytes: file.size,
      });
    } finally {
      setBusy(false);
    }
  };

  if (!path) {
    return (
      <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
        Bloc fichier
        <VoidSlateChildren>{children}</VoidSlateChildren>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div
        contentEditable={false}
        className="flex items-center justify-end gap-1 border-b border-border bg-muted/30 px-2 py-1"
      >
        <label className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-foreground hover:bg-muted">
          <Upload className="h-3.5 w-3.5" aria-hidden />
          Importer
          <input
            type="file"
            className="sr-only"
            disabled={busy || !pageId}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              e.target.value = "";
              void onPickFile(f);
            }}
          />
        </label>
        <RemoveBlockButton path={path} />
      </div>
      <div contentEditable={false} className="space-y-2 p-3">
        {busy ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Import…
          </p>
        ) : null}
        {err ? (
          <p className="text-sm text-destructive" role="alert">
            {err}
          </p>
        ) : null}
        <p className="text-[11px] text-muted-foreground">
          Import max {formatLimitBytes(MAX_FILE_UPLOAD_BYTES)} par fichier.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            URL du fichier
            <input
              type="url"
              placeholder="https://…"
              value={url}
              onChange={(e) => patch({ url: e.target.value })}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Nom affiché
            <input
              type="text"
              value={fileName}
              onChange={(e) => patch({ fileName: e.target.value })}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>
        {url.trim() ? (
          <a
            href={url.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm font-medium text-primary hover:bg-muted/40"
          >
            <Paperclip className="h-4 w-4 shrink-0" aria-hidden />
            <span className="min-w-0 truncate">
              {fileName.trim() || "Télécharger le fichier"}
            </span>
            {sizeBytes !== undefined ? (
              <span className="shrink-0 text-xs text-muted-foreground">
                ({formatBytes(sizeBytes)})
              </span>
            ) : null}
            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          </a>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/10 py-8 text-center text-sm text-muted-foreground">
            Colle une URL ou importe un fichier
          </div>
        )}
      </div>
      <VoidSlateChildren>{children}</VoidSlateChildren>
    </div>
  );
}

function BookmarkBlockBody({
  element,
  children,
}: Pick<RenderElementProps, "element" | "children">) {
  const editor = useSlate();
  const path = useBlockPath(element);
  const url = typeof element.url === "string" ? element.url : "";
  const ogTitle = typeof element.ogTitle === "string" ? element.ogTitle : "";
  const ogDescription =
    typeof element.ogDescription === "string" ? element.ogDescription : "";
  const ogImage = typeof element.ogImage === "string" ? element.ogImage : "";
  const ogSiteName =
    typeof element.ogSiteName === "string" ? element.ogSiteName : "";
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fetchGenRef = useRef(0);

  const patch = useCallback(
    (partial: Record<string, unknown>) => {
      if (!path) return;
      Transforms.setNodes(editor, partial as object, { at: path });
    },
    [editor, path],
  );

  const fetchPreviewCore = useCallback(
    async (targetUrl: string) => {
      const u = targetUrl.trim();
      if (!u || !path) return;
      const myGen = ++fetchGenRef.current;
      setErr(null);
      setBusy(true);
      try {
        const res = await fetch(
          `/api/link-preview?url=${encodeURIComponent(u)}`,
        );
        if (myGen !== fetchGenRef.current) return;
        const data = (await res.json()) as {
          error?: string;
          meta?: {
            title?: string;
            description?: string;
            image?: string;
            siteName?: string;
          };
        };
        if (myGen !== fetchGenRef.current) return;
        if (!res.ok) {
          setErr(data.error || "Aperçu indisponible");
          return;
        }
        const m = data.meta;
        if (!m) {
          setErr("Réponse vide");
          return;
        }
        if (myGen !== fetchGenRef.current) return;
        patch({
          ogTitle: m.title ?? "",
          ogDescription: m.description ?? "",
          ogImage: m.image ?? "",
          ogSiteName: m.siteName ?? "",
        });
      } catch {
        if (myGen === fetchGenRef.current) {
          setErr("Erreur réseau");
        }
      } finally {
        if (myGen === fetchGenRef.current) {
          setBusy(false);
        }
      }
    },
    [path, patch],
  );

  const hasPreview = Boolean(
    ogTitle.trim() || ogDescription.trim() || ogImage.trim(),
  );

  useEffect(() => {
    const u = url.trim();
    if (!path || !looksLikeHttpUrl(u)) return;
    if (hasPreview) return;

    const tid = window.setTimeout(() => {
      void fetchPreviewCore(u);
    }, 680);
    return () => window.clearTimeout(tid);
  }, [url, path, hasPreview, fetchPreviewCore]);

  if (!path) {
    return (
      <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
        Bloc lien
        <VoidSlateChildren>{children}</VoidSlateChildren>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div
        contentEditable={false}
        className="flex flex-wrap items-center justify-end gap-1 border-b border-border bg-muted/30 px-2 py-1"
      >
        <button
          type="button"
          disabled={busy || !url.trim()}
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => void fetchPreviewCore(url.trim())}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Link2 className="h-3.5 w-3.5" aria-hidden />
          )}
          Actualiser l’aperçu
        </button>
        <RemoveBlockButton path={path} />
      </div>
      <div contentEditable={false} className="space-y-3 p-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          URL de la page
          <input
            type="url"
            placeholder="https://…"
            value={url}
            onChange={(e) =>
              patch({
                url: e.target.value,
                ogTitle: "",
                ogDescription: "",
                ogImage: "",
                ogSiteName: "",
              })
            }
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        {err ? (
          <p className="text-sm text-destructive" role="alert">
            {err}
          </p>
        ) : null}
        {hasPreview && url.trim() ? (
          <a
            href={url.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex max-w-full overflow-hidden rounded-lg border border-border bg-muted/15 transition hover:bg-muted/30"
          >
            {ogImage ? (
              <div className="hidden w-28 shrink-0 border-r border-border sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ogImage}
                  alt=""
                  className="h-full max-h-32 w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1 p-3">
              <p className="text-xs text-muted-foreground">
                {ogSiteName || safeHostname(url.trim())}
              </p>
              {ogTitle ? (
                <p className="mt-1 font-medium text-foreground">{ogTitle}</p>
              ) : null}
              {ogDescription ? (
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                  {ogDescription}
                </p>
              ) : null}
            </div>
          </a>
        ) : url.trim() ? (
          <p className="text-sm text-muted-foreground">
            {busy ?
              "Chargement de l’aperçu…"
            : "L’aperçu se charge tout seul après la saisie ; tu peux aussi cliquer sur « Actualiser »."}
          </p>
        ) : (
          <div className="rounded-md border border-dashed border-border bg-muted/10 py-8 text-center text-sm text-muted-foreground">
            Saisis une URL (http ou https) pour afficher l’aperçu
          </div>
        )}
      </div>
      <VoidSlateChildren>{children}</VoidSlateChildren>
    </div>
  );
}

export function ImageBlock({
  attributes,
  children,
  element,
  gutter,
  rootDropPath,
}: RenderElementProps & {
  gutter?: React.ReactNode;
  rootDropPath?: Path;
}) {
  if (gutter && rootDropPath && rootDropPath.length === 1) {
    return (
      <RootBlockRow
        path={rootDropPath}
        attributes={attributes}
        className="group flex items-start gap-0.5 py-0.5 md:gap-1"
      >
        {gutter}
        <ImageBlockBody element={element}>{children}</ImageBlockBody>
      </RootBlockRow>
    );
  }
  if (gutter) {
    return (
      <div
        {...attributes}
        className="group flex items-start gap-0.5 py-0.5 md:gap-1"
      >
        {gutter}
        <ImageBlockBody element={element}>{children}</ImageBlockBody>
      </div>
    );
  }
  return (
    <div {...attributes} className="min-w-0">
      <ImageBlockBody element={element}>{children}</ImageBlockBody>
    </div>
  );
}

export function FileBlock({
  attributes,
  children,
  element,
  gutter,
  rootDropPath,
}: RenderElementProps & {
  gutter?: React.ReactNode;
  rootDropPath?: Path;
}) {
  if (gutter && rootDropPath && rootDropPath.length === 1) {
    return (
      <RootBlockRow
        path={rootDropPath}
        attributes={attributes}
        className="group flex items-start gap-0.5 py-0.5 md:gap-1"
      >
        {gutter}
        <FileBlockBody element={element}>{children}</FileBlockBody>
      </RootBlockRow>
    );
  }
  if (gutter) {
    return (
      <div
        {...attributes}
        className="group flex items-start gap-0.5 py-0.5 md:gap-1"
      >
        {gutter}
        <FileBlockBody element={element}>{children}</FileBlockBody>
      </div>
    );
  }
  return (
    <div {...attributes} className="min-w-0">
      <FileBlockBody element={element}>{children}</FileBlockBody>
    </div>
  );
}

export function BookmarkBlock({
  attributes,
  children,
  element,
  gutter,
  rootDropPath,
}: RenderElementProps & {
  gutter?: React.ReactNode;
  rootDropPath?: Path;
}) {
  if (gutter && rootDropPath && rootDropPath.length === 1) {
    return (
      <RootBlockRow
        path={rootDropPath}
        attributes={attributes}
        className="group flex items-start gap-0.5 py-0.5 md:gap-1"
      >
        {gutter}
        <BookmarkBlockBody element={element}>{children}</BookmarkBlockBody>
      </RootBlockRow>
    );
  }
  if (gutter) {
    return (
      <div
        {...attributes}
        className="group flex items-start gap-0.5 py-0.5 md:gap-1"
      >
        {gutter}
        <BookmarkBlockBody element={element}>{children}</BookmarkBlockBody>
      </div>
    );
  }
  return (
    <div {...attributes} className="min-w-0">
      <BookmarkBlockBody element={element}>{children}</BookmarkBlockBody>
    </div>
  );
}
