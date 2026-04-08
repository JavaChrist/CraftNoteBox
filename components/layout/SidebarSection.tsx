"use client";

import { ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Props = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  persistCollapse?: boolean;
  /** Clé localStorage pour l’état replié/déplié (une clé par section). */
  persistStorageKey?: string;
  /** Ancre pour liens type `/pages#…` depuis l’accueil. */
  sectionId?: string;
  hidden?: boolean;
  onShow?: () => void;
};

export default function SidebarSection({
  title,
  actions,
  children,
  defaultExpanded = true,
  persistCollapse = true,
  persistStorageKey = "cnb-sidebar-section-expanded",
  sectionId,
  hidden = false,
  onShow,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    if (!persistCollapse) return;
    try {
      const raw = localStorage.getItem(persistStorageKey);
      if (raw === "0") setExpanded(false);
      if (raw === "1") setExpanded(true);
    } catch {
      /* ignore */
    }
  }, [persistCollapse, persistStorageKey]);

  const toggle = useCallback(() => {
    setExpanded((v) => {
      const next = !v;
      if (persistCollapse) {
        try {
          localStorage.setItem(persistStorageKey, next ? "1" : "0");
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }, [persistCollapse, persistStorageKey]);

  if (hidden) {
    return (
      <div id={sectionId} className="scroll-mt-2 border-b border-border px-2 py-2">
        <button
          type="button"
          onClick={onShow}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate font-medium">{title}</span>
          <span className="text-[10px] uppercase tracking-wide">afficher</span>
        </button>
      </div>
    );
  }

  return (
    <div id={sectionId} className="scroll-mt-2 border-b border-border py-1">
      <div className="flex items-center gap-0.5 pr-1">
        <button
          type="button"
          onClick={toggle}
          className="flex h-8 w-7 shrink-0 items-center justify-center rounded text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          aria-expanded={expanded}
          aria-label={expanded ? "Replier la section" : "Déplier la section"}
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
            aria-hidden
          />
        </button>
        <span className="min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {title}
        </span>
        {actions ? (
          <div className="flex shrink-0 items-center gap-0.5">{actions}</div>
        ) : null}
      </div>
      {expanded ? (
        <div className="pb-1 pt-0.5">{children}</div>
      ) : null}
    </div>
  );
}
