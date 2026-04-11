"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { ReactEditor, useSlate } from "slate-react";
import type { SlashMenuState } from "@/lib/editor/slash-commands";
import type { BlockType } from "@/lib/db/types";
import type { AiAction } from "@/lib/ai/types";

type Props = {
  state: SlashMenuState | null;
  /** Index parmi les entrées sélectionnables uniquement (blocs réels). */
  selectedSelectableIndex: number;
  onFilterChange: (filter: string) => void;
  onSelectBlock: (type: BlockType) => void;
  onSelectJavaChrist?: (action: AiAction) => void;
};

export default function SlashCommandMenu({
  state,
  selectedSelectableIndex,
  onFilterChange,
  onSelectBlock,
  onSelectJavaChrist,
}: Props) {
  const editor = useSlate();
  const listRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    left: number;
    top?: number;
    bottom?: number;
    maxHeight: number;
  } | null>(null);

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
      const pad = 8;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const menuWidth = Math.min(320, vw - 24);
      const left = Math.max(12, Math.min(rect.left, vw - menuWidth - 12));

      const spaceBelow = vh - rect.bottom - pad;
      const spaceAbove = rect.top - pad;
      /** Hauteur max raisonnable pour le menu (filtre + liste + pied). */
      const cap = Math.min(vh * 0.85, 520);
      const preferBelow = spaceBelow >= 200 || spaceBelow >= spaceAbove;

      if (preferBelow) {
        const maxHeight = Math.min(cap, Math.max(160, spaceBelow - 4));
        setCoords({ left, top: rect.bottom + pad, maxHeight });
      } else {
        const maxHeight = Math.min(cap, Math.max(160, spaceAbove - 4));
        setCoords({
          left,
          bottom: vh - rect.top + pad,
          maxHeight,
        });
      }
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

  const hasSelectable = selectableRowIndices.length > 0;

  const menuStyle: CSSProperties = {
    left: coords.left,
    maxHeight: coords.maxHeight,
    ...(coords.top !== undefined ?
      { top: coords.top }
    : { bottom: coords.bottom }),
  };

  return createPortal(
    <div
      data-slash-command-menu=""
      className="fixed z-50 flex w-[min(100vw-1.5rem,20rem)] max-w-[20rem] min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
      style={menuStyle}
      onMouseDown={(e) => e.preventDefault()}
      role="presentation"
      aria-label="Blocs et commandes"
    >
      <div className="shrink-0 border-b border-border p-2">
        <label className="sr-only" htmlFor="slash-menu-filter">
          Filtrer les blocs
        </label>
        <input
          id="slash-menu-filter"
          type="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Rechercher un bloc…"
          value={state.filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div
        ref={listRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5"
        role="listbox"
        aria-label="Liste des blocs"
      >
        {!hasSelectable && rows.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Aucun résultat. Modifie ta recherche.
          </p>
        ) : null}
        {!hasSelectable && rows.length > 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            Aucun bloc ne correspond à « {state.filter} ».
          </p>
        ) : null}
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
      <div className="flex shrink-0 items-center justify-between border-t border-border px-2.5 py-2 text-[11px] text-muted-foreground">
        <span>Fermer le menu</span>
        <kbd className="rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px]">
          esc
        </kbd>
      </div>
    </div>,
    document.body,
  );
}
