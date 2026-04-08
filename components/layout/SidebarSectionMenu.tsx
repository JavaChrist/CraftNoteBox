"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Library,
  MoreHorizontal,
  PanelBottomClose,
  Rows3,
} from "lucide-react";

export type SectionMenuActionId =
  | "sort"
  | "move-up"
  | "move-down"
  | "hide"
  | "library";

type MenuItem = {
  id: SectionMenuActionId;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  disabled?: boolean;
  hint?: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: "sort",
    label: "Afficher / trier",
    icon: Rows3,
    disabled: true,
    hint: "Bientôt",
  },
  {
    id: "move-up",
    label: "Remonter la section",
    icon: ArrowUp,
    disabled: true,
    hint: "Bientôt",
  },
  {
    id: "move-down",
    label: "Descendre la section",
    icon: ArrowDown,
    disabled: true,
    hint: "Bientôt",
  },
  {
    id: "hide",
    label: "Masquer la section",
    icon: PanelBottomClose,
  },
  {
    id: "library",
    label: "Ouvrir dans la bibliothèque",
    icon: Library,
    disabled: true,
    hint: "Phase 2",
  },
];

type Props = {
  onHideSection: () => void;
  /** Pour l’accessibilité du bouton « … » (ex. « Pages privées », « Pages PRO »). */
  sectionLabel?: string;
};

export default function SidebarSectionMenu({
  onHideSection,
  sectionLabel = "Pages privées",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menu de la section ${sectionLabel}`}
        title="Plus d’actions"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-[220px] rounded-md border border-border bg-popover py-1 shadow-md"
        >
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const onActivate = () => {
              if (item.disabled) return;
              if (item.id === "hide") {
                onHideSection();
                setOpen(false);
              }
            };
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={onActivate}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.hint ? (
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {item.hint}
                  </span>
                ) : null}
              </button>
            );
          })}
          <div className="my-1 border-t border-border" role="presentation" />
          <p className="px-3 py-1.5 text-[11px] leading-snug text-muted-foreground">
            D’autres actions seront ajoutées au fil des versions.
          </p>
        </div>
      ) : null}
    </div>
  );
}
