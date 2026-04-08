"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ReactEditor, useSlate } from "slate-react";
import type { SlashMenuState } from "@/lib/editor/slash-commands";
import type { BlockType } from "@/lib/db/types";
import type { AiAction } from "@/lib/ai/types";

type Props = {
  state: SlashMenuState | null;
  /** Index parmi les entrées sélectionnables uniquement (blocs réels). */
  selectedSelectableIndex: number;
  onSelectBlock: (type: BlockType) => void;
  onSelectJavaChrist?: (action: AiAction) => void;
};

export default function SlashCommandMenu({
  state,
  selectedSelectableIndex,
  onSelectBlock,
  onSelectJavaChrist,
}: Props) {
  const editor = useSlate();
  const listRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!state) {
      setCoords(null);
      return;
    }
    try {
      const domRange = ReactEditor.toDOMRange(editor as ReactEditor, {
        anchor: state.slashPoint,
        focus: state.slashPoint,
      });
      const rect = domRange.getBoundingClientRect();
      const pad = 6;
      const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
      const menuWidth = 320;
      let left = rect.left + window.scrollX;
      left = Math.min(left, vw + window.scrollX - menuWidth - 12);
      setCoords({
        top: rect.bottom + window.scrollY + pad,
        left: Math.max(12 + window.scrollX, left),
      });
    } catch {
      setCoords(null);
    }
  }, [editor, state]);

  useLayoutEffect(() => {
    if (!state || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-slash-order="${selectedSelectableIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [state, selectedSelectableIndex]);

  if (!state || !coords || typeof document === "undefined") return null;

  const { rows, selectableRowIndices } = state;

  return createPortal(
    <div
      className="fixed z-50 flex w-[min(100vw-1.5rem,20rem)] max-w-[20rem] flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
      style={{ top: coords.top, left: coords.left }}
      onMouseDown={(e) => e.preventDefault()}
      role="listbox"
      aria-label="Blocs et commandes"
    >
      <div
        ref={listRef}
        className="max-h-[min(70vh,26rem)] overflow-y-auto overscroll-contain p-1.5"
      >
        {rows.map((row, rowIndex) => {
          if (row.kind === "heading") {
            return (
              <div
                key={row.key}
                className="sticky top-0 z-[1] bg-popover px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                role="presentation"
              >
                {row.title}
              </div>
            );
          }

          if (row.kind === "soon") {
            const Icon = row.Icon;
            return (
              <div
                key={row.key}
                className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-2 py-2 text-left opacity-50"
                role="presentation"
                aria-disabled
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm">{row.label}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {row.hint}
                  </div>
                </div>
                {row.shortcut ? (
                  <kbd className="hidden shrink-0 rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                    {row.shortcut}
                  </kbd>
                ) : null}
              </div>
            );
          }

          if (row.kind === "javachrist") {
            const order = selectableRowIndices.indexOf(rowIndex);
            const isSelected = order === selectedSelectableIndex;
            const Icon = row.Icon;
            return (
              <button
                key={row.key}
                type="button"
                data-slash-order={order}
                role="option"
                aria-selected={isSelected}
                className={`flex w-full flex-col gap-0.5 rounded-lg px-2 py-2 text-left text-sm transition ${
                  isSelected
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted/80"
                }`}
                onClick={() => onSelectJavaChrist?.(row.action)}
              >
                <div className="flex w-full items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isSelected ? "" : "text-muted-foreground"}`}
                  />
                  <span className="min-w-0 flex-1 font-medium">{row.label}</span>
                  {row.shortcut ? (
                    <kbd
                      className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                        isSelected
                          ? "border-accent-foreground/30 bg-accent-foreground/10"
                          : "border-border bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {row.shortcut}
                    </kbd>
                  ) : null}
                </div>
                <span
                  className={`pl-6 text-[11px] ${isSelected ? "text-accent-foreground/90" : "text-muted-foreground"}`}
                >
                  {row.description}
                </span>
              </button>
            );
          }

          if (row.kind !== "block") return null;

          const order = selectableRowIndices.indexOf(rowIndex);
          const isSelected = order === selectedSelectableIndex;
          const Icon = row.Icon;

          return (
            <button
              key={row.key}
              type="button"
              data-slash-order={order}
              role="option"
              aria-selected={isSelected}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition ${
                isSelected
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted/80"
              }`}
              onClick={() => onSelectBlock(row.type)}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${isSelected ? "" : "text-muted-foreground"}`}
              />
              <span className="min-w-0 flex-1 font-medium">{row.label}</span>
              {row.shortcut ? (
                <kbd
                  className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                    isSelected
                      ? "border-accent-foreground/30 bg-accent-foreground/10"
                      : "border-border bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {row.shortcut}
                </kbd>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-border px-2.5 py-2 text-[11px] text-muted-foreground">
        <span>Fermer le menu</span>
        <kbd className="rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px]">
          esc
        </kbd>
      </div>
    </div>,
    document.body,
  );
}
