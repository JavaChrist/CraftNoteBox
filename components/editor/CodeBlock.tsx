"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Transforms } from "slate";
import { ReactEditor, useSlate } from "slate-react";
import type { Path } from "slate";
import type { RenderElementProps } from "slate-react";
import {
  CODE_LANGUAGE_OPTIONS,
  codeLanguageLabel,
  normalizeCodeLanguage,
} from "@/lib/editor/code-languages";
import RootBlockRow from "./RootBlockRow";

const preCls =
  "hljs editor-slate-code-pre m-0 overflow-x-auto rounded-b-md border-0 border-t border-zinc-700/50 bg-[#0d1117] px-3 py-2 font-mono text-[0.9rem] leading-relaxed text-[#e6edf3]";

function CodeBlockLanguageMenu({
  currentId,
  buttonRef,
  open,
  onClose,
  onPick,
}: {
  currentId: string;
  buttonRef: RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
  onPick: (id: string) => void;
}) {
  const [filter, setFilter] = useState("");
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const anchor = buttonRef.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    const w = Math.min(280, vw - 24);
    let left = Math.min(r.right - w, vw - w - 12);
    left = Math.max(12, left);
    setPos({
      top: r.bottom + 6 + window.scrollY,
      left: left + window.scrollX,
      width: w,
    });
  }, [open, buttonRef]);

  useEffect(() => {
    if (!open) {
      setFilter("");
      return;
    }
    const onDoc = (e: MouseEvent) => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (rootRef.current?.contains(t)) return;
      if (buttonRef.current?.contains(t)) return;
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
  }, [open, onClose, buttonRef]);

  if (!open || !pos || typeof document === "undefined") return null;

  const q = filter.trim().toLowerCase();
  const list = CODE_LANGUAGE_OPTIONS.filter(
    (o) =>
      !q ||
      o.label.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q),
  );

  return createPortal(
    <div
      ref={rootRef}
      className="fixed z-[60] flex max-h-[min(70vh,22rem)] flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
      style={{ top: pos.top, left: pos.left, width: pos.width }}
      onMouseDown={(e) => e.preventDefault()}
      role="listbox"
      aria-label="Langages"
    >
      <div className="border-b border-border p-2">
        <label className="sr-only" htmlFor="code-lang-filter">
          Rechercher un langage
        </label>
        <input
          id="code-lang-filter"
          type="search"
          autoComplete="off"
          autoFocus
          placeholder="Rechercher un langage…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="max-h-[min(50vh,18rem)] overflow-y-auto overscroll-contain p-1">
        {list.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            Aucun résultat
          </p>
        ) : (
          list.map((o) => {
            const active = o.id === currentId;
            return (
              <button
                key={o.id}
                type="button"
                role="option"
                aria-selected={active}
                className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition ${
                  active
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted/80"
                }`}
                onClick={() => {
                  onPick(o.id);
                  onClose();
                }}
              >
                <span>{o.label}</span>
                {active ? (
                  <Check className="h-4 w-4 shrink-0" aria-hidden />
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body,
  );
}

function useCodeBlockLanguage(element: RenderElementProps["element"]) {
  const editor = useSlate();
  const lang = normalizeCodeLanguage(
    typeof (element as { language?: unknown }).language === "string"
      ? (element as { language: string }).language
      : undefined,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const setLanguage = (id: string) => {
    try {
      const path = ReactEditor.findPath(editor as ReactEditor, element);
      Transforms.setNodes(
        editor,
        { language: normalizeCodeLanguage(id) } as object,
        { at: path },
      );
      ReactEditor.focus(editor as ReactEditor);
    } catch {
      /* ignore */
    }
  };

  const toolbar = (
    <div
      contentEditable={false}
      className="flex items-center justify-end gap-1 border-b border-zinc-700/60 bg-zinc-900/90 px-2 py-1 dark:bg-zinc-900/80"
    >
      <button
        ref={btnRef}
        type="button"
        title="Langage du bloc code"
        aria-expanded={menuOpen}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setMenuOpen((v) => !v)}
      >
        {codeLanguageLabel(lang)}
        <ChevronDown className="h-3.5 w-3.5 opacity-80" aria-hidden />
      </button>
    </div>
  );

  const menu = (
    <CodeBlockLanguageMenu
      currentId={lang}
      buttonRef={btnRef}
      open={menuOpen}
      onClose={() => setMenuOpen(false)}
      onPick={setLanguage}
    />
  );

  return { lang, toolbar, menu };
}

function CodeBlockBody({
  children,
  element,
}: Pick<RenderElementProps, "children" | "element">) {
  const { lang, toolbar, menu } = useCodeBlockLanguage(element);
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-zinc-950 shadow-sm dark:border-zinc-700">
      {toolbar}
      <pre className={preCls}>
        <code
          className={`block whitespace-pre-wrap text-inherit language-${lang}`}
        >
          {children}
        </code>
      </pre>
      {menu}
    </div>
  );
}

export default function CodeBlock({
  attributes,
  children,
  element,
  gutter,
  rootDropPath,
}: RenderElementProps & { gutter?: React.ReactNode; rootDropPath?: Path }) {
  if (gutter && rootDropPath && rootDropPath.length === 1) {
    return (
      <RootBlockRow
        path={rootDropPath}
        attributes={attributes}
        className="group flex items-start gap-0.5 py-0.5 md:gap-1"
      >
        {gutter}
        <CodeBlockBody element={element}>{children}</CodeBlockBody>
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
        <CodeBlockBody element={element}>{children}</CodeBlockBody>
      </div>
    );
  }

  return (
    <div {...attributes} className="min-w-0">
      <CodeBlockBody element={element}>{children}</CodeBlockBody>
    </div>
  );
}
