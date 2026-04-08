"use client";

import { useEffect, useRef } from "react";
import { AI_ACTIONS } from "@/lib/ai/types";
import { AI_ACTION_LABELS } from "@/lib/ai/prompts";
import JavaChristActionItem from "@/components/ai/JavaChristActionItem";
import type { AiAction } from "@/lib/ai/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (action: AiAction) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
};

export default function JavaChristMenu({
  open,
  onClose,
  onSelect,
  anchorRef,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
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
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="JavaChrist — actions IA"
      className="absolute right-0 top-full z-50 mt-1 max-h-[min(70vh,22rem)] w-[min(100vw-2rem,18rem)] overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-lg"
    >
      <div className="border-b border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        JavaChrist
      </div>
      {AI_ACTIONS.map((action) => {
        const meta = AI_ACTION_LABELS[action];
        return (
          <JavaChristActionItem
            key={action}
            label={meta.label}
            description={meta.description}
            onClick={() => {
              onSelect(action);
              onClose();
            }}
          />
        );
      })}
    </div>
  );
}
