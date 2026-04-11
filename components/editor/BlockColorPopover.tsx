"use client";

import { Eraser } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ReactEditor, useSlate } from "slate-react";
import {
  getActiveTextColor,
  setTextColor,
  TEXT_COLOR_PRESETS,
} from "@/lib/editor/text-color";

type Props = {
  anchorRect: DOMRect;
  onClose: () => void;
};

export default function BlockColorPopover({ anchorRect, onClose }: Props) {
  const editor = useSlate();
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const active = getActiveTextColor(editor);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const pad = 6;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const menuWidth = 280;
    let left = anchorRect.left + window.scrollX;
    left = Math.min(left, vw + window.scrollX - menuWidth - 12);
    setCoords({
      top: anchorRect.bottom + window.scrollY + pad,
      left: Math.max(12 + window.scrollX, left),
    });
  }, [anchorRect]);

  useLayoutEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!coords || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={rootRef}
      className="fixed z-50 flex w-[min(100vw-1.5rem,17.5rem)] max-w-[17.5rem] flex-col gap-2 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg"
      style={{ top: coords.top, left: coords.left }}
      role="dialog"
      aria-label="Couleur du texte"
      onMouseDown={(e) => e.preventDefault()}
    >
      <p className="px-0.5 text-[11px] text-muted-foreground">
        Bloc entier sélectionné — choisis une couleur ou le défaut.
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {TEXT_COLOR_PRESETS.map(({ key, label, hex }) => {
          const isActive = active?.toLowerCase() === hex.toLowerCase();
          return (
            <button
              key={key}
              type="button"
              title={label}
              aria-label={`Couleur ${label}`}
              aria-pressed={isActive}
              onClick={() => {
                setTextColor(editor, hex);
                ReactEditor.focus(editor);
                onClose();
              }}
              className={`h-7 w-7 rounded-md border-2 transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${
                isActive
                  ? "border-primary ring-1 ring-primary/40"
                  : "border-transparent hover:border-border"
              }`}
              style={{ backgroundColor: hex }}
            />
          );
        })}
      </div>
      <button
        type="button"
        title="Couleur par défaut du thème"
        aria-label="Réinitialiser la couleur du texte"
        onClick={() => {
          setTextColor(editor, null);
          ReactEditor.focus(editor);
          onClose();
        }}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      >
        <Eraser className="h-3.5 w-3.5" aria-hidden />
        Défaut
      </button>
    </div>,
    document.body,
  );
}
