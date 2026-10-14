"use client";

import { Loader2, Upload, Video, Volume2 } from "lucide-react";
import { useState } from "react";
import { Transforms, type Path } from "slate";
import { useSlate, type RenderElementProps } from "slate-react";
import {
  formatLimitBytes,
  MAX_FILE_UPLOAD_BYTES,
  validateUploadFileSize,
} from "@/lib/media/upload-limits";
import { uploadPageAsset } from "@/lib/media/upload-page-asset";
import { resolveEmbed, resolveVideoSource } from "@/lib/editor/rich-blocks";
import { useEditorBlockChrome } from "./editor-block-chrome-context";
import {
  blockFieldClass,
  useBlockPath,
  VoidBlockFrame,
  VoidSlateChildren,
} from "./VoidBlockFrame";

function PlaybackBody({
  element,
  children,
  kind,
}: Pick<RenderElementProps, "element" | "children"> & {
  kind: "video" | "audio";
}) {
  const editor = useSlate();
  const chrome = useEditorBlockChrome();
  const path = useBlockPath(element);
  const url = typeof element.url === "string" ? element.url : "";
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const pageId = chrome?.pageId ?? "";

  const patch = (partial: Record<string, unknown>) => {
    if (!path) return;
    Transforms.setNodes(editor, partial as object, { at: path });
  };

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
      const uploaded = await uploadPageAsset(pageId, file, "file");
      if (!uploaded.ok) {
        setErr(uploaded.message);
        return;
      }
      patch({ url: uploaded.publicUrl, fileName: file.name, mimeType: file.type });
    } finally {
      setBusy(false);
    }
  };

  const video = kind === "video" ? resolveVideoSource(url) : null;
  const audioEmbed = kind === "audio" ? resolveEmbed(url) : null;

  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div
        contentEditable={false}
        className="flex items-center justify-end gap-1 border-b border-border bg-muted/30 px-2 py-1"
      >
        <label className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 text-xs font-medium hover:bg-muted">
          <Upload className="h-3.5 w-3.5" aria-hidden />
          Importer
          <input
            type="file"
            accept={kind === "video" ? "video/*" : "audio/*"}
            className="sr-only"
            disabled={busy || !pageId}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              event.target.value = "";
              void onPickFile(file);
            }}
          />
        </label>
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
          Import max {formatLimitBytes(MAX_FILE_UPLOAD_BYTES)}, ou colle une URL.
        </p>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {kind === "video" ? "URL de la vidéo" : "URL du fichier audio"}
          <input
            type="url"
            placeholder="https://…"
            value={url}
            onChange={(event) => patch({ url: event.target.value })}
            className={blockFieldClass}
          />
        </label>
        {kind === "video" && video?.kind === "iframe" ? (
          <div className="aspect-video overflow-hidden rounded-md border border-border bg-black">
            <iframe
              title="Vidéo intégrée"
              src={video.src}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}
        {kind === "video" && video?.kind === "file" ? (
          <video
            key={video.src}
            src={video.src}
            controls
            className="max-h-[min(70vh,28rem)] w-full rounded-md bg-black"
          />
        ) : null}
        {kind === "audio" && audioEmbed?.kind === "iframe" ? (
          <iframe
            title={audioEmbed.title}
            src={audioEmbed.src}
            className="h-40 w-full rounded-md border border-border"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        ) : null}
        {kind === "audio" && url.trim() && audioEmbed?.kind !== "iframe" ? (
          <audio key={url} src={url.trim()} controls className="w-full" />
        ) : null}
        {!url.trim() ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/10 py-8 text-center text-sm text-muted-foreground">
            {kind === "video" ? (
              <Video className="h-8 w-8 opacity-50" aria-hidden />
            ) : (
              <Volume2 className="h-8 w-8 opacity-50" aria-hidden />
            )}
            {kind === "video"
              ? "YouTube, Vimeo, ou un fichier vidéo"
              : "Fichier audio, ou un lien Spotify"}
          </div>
        ) : null}
      </div>
      <VoidSlateChildren>{children}</VoidSlateChildren>
    </div>
  );
}

function PlaybackBlock({
  kind,
  attributes,
  children,
  element,
  gutter,
  rootDropPath,
}: RenderElementProps & {
  kind: "video" | "audio";
  gutter?: React.ReactNode;
  rootDropPath?: Path;
}) {
  return (
    <VoidBlockFrame
      attributes={attributes}
      gutter={gutter}
      rootDropPath={rootDropPath}
    >
      <PlaybackBody element={element} kind={kind}>
        {children}
      </PlaybackBody>
    </VoidBlockFrame>
  );
}

export function VideoBlock(
  props: RenderElementProps & {
    gutter?: React.ReactNode;
    rootDropPath?: Path;
  },
) {
  return <PlaybackBlock {...props} kind="video" />;
}

export function AudioBlock(
  props: RenderElementProps & {
    gutter?: React.ReactNode;
    rootDropPath?: Path;
  },
) {
  return <PlaybackBlock {...props} kind="audio" />;
}
