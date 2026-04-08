"use client";

import { useCallback, useState } from "react";
import { Editor, Transforms } from "slate";
import { ReactEditor, useSlate } from "slate-react";
import { getFullDocumentPlainText, aiResultToNodes } from "@/lib/editor/javachrist-text";

type Phase = "idle" | "loading" | "preview";

type Props = {
  pageTitle?: string | null;
};

export default function SummarizePageWithJavaChrist({ pageTitle }: Props) {
  const editor = useSlate();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resultText, setResultText] = useState("");

  const closePreview = useCallback(() => {
    setPhase("idle");
    setResultText("");
    setError(null);
  }, []);

  const runSummary = useCallback(async () => {
    const content = getFullDocumentPlainText(editor).trim();
    if (!content) {
      setError("La page est vide : ajoute du texte avant de résumer.");
      return;
    }

    setError(null);
    setResultText("");
    setPhase("loading");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "summary",
          content,
          pageTitle: pageTitle ?? undefined,
        }),
      });
      const data = (await res.json()) as { result?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Erreur ${res.status}`);
      }
      if (!data.result?.trim()) {
        throw new Error("Réponse vide.");
      }
      setResultText(data.result.trim());
      setPhase("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l’appel IA");
      setPhase("idle");
    }
  }, [editor, pageTitle]);

  const insertAtTop = useCallback(() => {
    if (!resultText) return;
    const nodes = aiResultToNodes(resultText);
    ReactEditor.focus(editor as ReactEditor);
    Editor.withoutNormalizing(editor, () => {
      Transforms.insertNodes(editor, nodes as any, { at: [0] });
    });
    closePreview();
  }, [editor, resultText, closePreview]);

  const insertAtBottom = useCallback(() => {
    if (!resultText) return;
    const nodes = aiResultToNodes(resultText);
    ReactEditor.focus(editor as ReactEditor);
    Editor.withoutNormalizing(editor, () => {
      const at = editor.children.length;
      Transforms.insertNodes(editor, nodes as any, { at: [at] });
    });
    closePreview();
  }, [editor, resultText, closePreview]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={runSummary}
          disabled={phase === "loading"}
          className="rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-secondary disabled:opacity-60"
        >
          {phase === "loading" ? "Résumé…" : "✨ Résumer avec JavaChrist"}
        </button>
      </div>

      {error && phase === "idle" ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {phase === "preview" ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePreview();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="javachrist-summary-title"
            className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border px-4 py-3">
              <h2
                id="javachrist-summary-title"
                className="text-sm font-semibold text-foreground"
              >
                Résumé
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">Page entière</p>
            </div>
            <div className="max-h-[45vh] overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
                {resultText}
              </pre>
            </div>
            <div className="flex flex-col gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={closePreview}
                className="rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-secondary"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={insertAtTop}
                className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium transition hover:bg-secondary/80"
              >
                Insérer en haut
              </button>
              <button
                type="button"
                onClick={insertAtBottom}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Insérer en bas
              </button>
            </div>
            <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              Validation requise pour insérer.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
