"use client";

import { useCallback, useRef, useState } from "react";
import { Editor, Range, Transforms, type Point } from "slate";
import { ReactEditor, useSlate } from "slate-react";
import JavaChristButton from "@/components/ai/JavaChristButton";
import JavaChristMenu from "@/components/ai/JavaChristMenu";
import { useRegisterJavaChristRunner } from "@/components/ai/java-christ-context";
import type { AiAction, AiSelectionMode } from "@/lib/ai/types";
import {
  getJavaChristSource,
  aiResultToNodes,
} from "@/lib/editor/javachrist-text";

type Phase = "idle" | "loading" | "preview";

type Props = {
  pageTitle?: string | null;
  selectionMode?: AiSelectionMode;
};

export default function JavaChristPanel({
  pageTitle,
  selectionMode = "auto",
}: Props) {
  const editor = useSlate();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resultText, setResultText] = useState("");
  const [sourceHint, setSourceHint] = useState("");
  const [activeAction, setActiveAction] = useState<AiAction | null>(null);
  const [ctx, setCtx] = useState<{
    hadExpandedSelection: boolean;
    replaceRange: Range | null;
    insertPoint: Point;
  } | null>(null);

  const runAction = useCallback(
    async (action: AiAction) => {
      const src = getJavaChristSource(editor, selectionMode);
      if (!src.text.trim()) {
        setError(
          "Aucun texte : sélectionne du contenu ou ajoute du texte dans la page.",
        );
        return;
      }

      setActiveAction(action);
      setCtx({
        hadExpandedSelection: src.hadExpandedSelection,
        replaceRange: src.replaceRange,
        insertPoint: src.insertPoint,
      });
      setSourceHint(
        src.hadExpandedSelection
          ? "Texte envoyé : sélection"
          : selectionMode === "current_block"
            ? "Texte envoyé : bloc courant"
            : "Texte envoyé : page entière",
      );
      setError(null);
      setResultText("");
      setPhase("loading");

      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            content: src.text,
            pageTitle: pageTitle ?? undefined,
            selectionMode,
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
        setCtx(null);
        setActiveAction(null);
      }
    },
    [editor, pageTitle, selectionMode],
  );

  useRegisterJavaChristRunner(runAction);

  const closePreview = useCallback(() => {
    setPhase("idle");
    setResultText("");
    setError(null);
    setCtx(null);
    setActiveAction(null);
  }, []);

  const applyInsert = useCallback(() => {
    if (!ctx || !resultText) return;
    const nodes = aiResultToNodes(resultText);
    ReactEditor.focus(editor as ReactEditor);
    Editor.withoutNormalizing(editor, () => {
      Transforms.select(editor, {
        anchor: ctx.insertPoint,
        focus: ctx.insertPoint,
      });
      Transforms.insertFragment(editor, nodes as any);
    });
    closePreview();
  }, [editor, ctx, resultText, closePreview]);

  const applyReplace = useCallback(() => {
    if (!ctx?.replaceRange || !Range.isExpanded(ctx.replaceRange) || !resultText)
      return;
    const nodes = aiResultToNodes(resultText);
    ReactEditor.focus(editor as ReactEditor);
    Editor.withoutNormalizing(editor, () => {
      Transforms.select(editor, ctx.replaceRange!);
      Transforms.delete(editor);
      Transforms.insertFragment(editor, nodes as any);
    });
    closePreview();
  }, [editor, ctx, resultText, closePreview]);

  const insertLabel = ctx?.hadExpandedSelection
    ? "Insérer après la sélection"
    : "Insérer sous le bloc courant";

  return (
    <>
      <div className="relative flex justify-end">
        <JavaChristButton
          ref={btnRef}
          pending={phase === "loading"}
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          IA JavaChrist
        </JavaChristButton>
        <JavaChristMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onSelect={runAction}
          anchorRef={btnRef}
        />
      </div>

      {error && phase === "idle" ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {phase === "loading" ? (
        <p className="text-xs text-muted-foreground">JavaChrist…</p>
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
            aria-labelledby="javachrist-title"
            className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border px-4 py-3">
              <h2
                id="javachrist-title"
                className="text-sm font-semibold text-foreground"
              >
                Résultat
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">{sourceHint}</p>
              {activeAction === "reformulate" && ctx?.hadExpandedSelection ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Remplacer la sélection ou insérer à côté.
                </p>
              ) : null}
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
                onClick={applyInsert}
                className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium transition hover:bg-secondary/80"
              >
                {insertLabel}
              </button>
              {ctx?.hadExpandedSelection ? (
                <button
                  type="button"
                  onClick={applyReplace}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  Remplacer la sélection
                </button>
              ) : null}
            </div>
            <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              Rien n’est appliqué sans clic sur un bouton d’action.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
