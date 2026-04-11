"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent } from "react";
import {
  createEditor,
  Descendant,
  Editor as SlateEditor,
  Element as SlateElement,
  Node,
  Transforms,
  type NodeEntry,
  type Path,
} from "slate";
import { withHistory } from "slate-history";
import {
  Editable,
  ReactEditor,
  Slate,
  withReact,
  type RenderLeafProps,
} from "slate-react";
import isHotkey from "is-hotkey";
import BlockColorPopover from "./BlockColorPopover";
import Element from "./Element";
import SlashCommandMenu from "./SlashCommandMenu";
import { EditorBlockChromeContext } from "./editor-block-chrome-context";
import {
  applySlashCommand,
  createSlashMenuStateFromButton,
  dismissSlashText,
  type SlashMenuState,
} from "@/lib/editor/slash-commands";
import { createAutosave } from "@/lib/utils/autosave";
import type { Block, BlockType, Page } from "@/lib/db/types";
import { SaveStatusLine } from "@/components/ui/save-status-line";
import { moveRootBlockBefore } from "@/lib/editor/move-root-block";
import { withBlockEditor } from "@/lib/editor/transforms";
import { blocksToSlateValue } from "@/lib/editor/slate-value";
import { decorationsForCodeBlock } from "@/lib/editor/code-decorations";
import { isAllowedTextColor } from "@/lib/editor/text-color";
import { ensureEditorDocumentValid } from "@/lib/editor/ensure-document";
import JavaChristPanel from "@/components/ai/JavaChristPanel";
import SummarizePageWithJavaChrist from "@/components/ai/SummarizePageWithJavaChrist";
import {
  JavaChristProvider,
  useJavaChristController,
} from "@/components/ai/java-christ-context";

type UpsertBlockInput = {
  id?: string;
  type: BlockType;
  content: unknown;
  orderIndex: number;
};

function serializeBlocks(
  value: Descendant[],
  previous: Block[],
): UpsertBlockInput[] {
  return value.map((node, index) => ({
    id: previous[index]?.id,
    type: (node as any).type ?? "paragraph",
    content: node,
    orderIndex: index,
  }));
}

type Props = {
  page: Page;
  initialBlocks: Block[];
  onSave: (blocks: UpsertBlockInput[]) => Promise<any>;
};

function EditorInner({ page, initialBlocks, onSave }: Props) {
  const { runJavaChrist } = useJavaChristController();
  const editor = useMemo(
    () => withBlockEditor(withHistory(withReact(createEditor()))),
    [],
  );
  const initialValue = useMemo(
    () => blocksToSlateValue(initialBlocks),
    [initialBlocks],
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);
  const [colorPopover, setColorPopover] = useState<{
    anchorRect: DOMRect;
  } | null>(null);
  const slashMenuRef = useRef<SlashMenuState | null>(null);
  const slashIndexRef = useRef(0);
  slashMenuRef.current = slashMenu;
  slashIndexRef.current = slashIndex;

  const [, bumpEditor] = useReducer((n: number) => n + 1, 0);

  const serverFallbackRef = useRef(initialValue);
  serverFallbackRef.current = initialValue;

  const stabilizeDocument = useCallback(() => {
    if (ensureEditorDocumentValid(editor, serverFallbackRef.current)) {
      bumpEditor();
    }
  }, [editor]);

  useLayoutEffect(() => {
    SlateEditor.normalize(editor, { force: true });
    if (ensureEditorDocumentValid(editor, initialValue)) {
      bumpEditor();
    }
  }, [editor, page.id]);

  const renderElement = useCallback(
    (props: any) => <Element {...props} />,
    [],
  );

  const decorate = useCallback(
    ([node, path]: NodeEntry) => {
      if (SlateElement.isElement(node) && node.type === "code") {
        return decorationsForCodeBlock(node, path);
      }
      return [];
    },
    [],
  );

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    const { leaf, attributes, children } = props;
    const hljsClass = (leaf as { hljsClass?: string }).hljsClass;
    if (hljsClass) {
      return (
        <span {...attributes} className={hljsClass}>
          {children}
        </span>
      );
    }
    const color =
      leaf.color && isAllowedTextColor(leaf.color) ? leaf.color : undefined;
    const style = color ? { color } : undefined;
    return (
      <span
        {...attributes}
        style={style}
        className={style ? undefined : "text-foreground"}
      >
        {children}
      </span>
    );
  }, []);

  const debouncedSave = useMemo(
    () =>
      createAutosave(async (val: Descendant[]) => {
        setSaving(true);
        try {
          const payload = serializeBlocks(val, initialBlocks);
          await onSave(payload);
          setDirty(false);
          setLastSavedAt(new Date());
          setError(null);
        } catch (err) {
          console.error("save error", err);
          const msg =
            err instanceof Error
              ? err.message
              : "Échec de la sauvegarde du contenu";
          setError(msg);
        } finally {
          setSaving(false);
        }
      }, 800),
    [initialBlocks, onSave],
  );

  const handleChange = (val: Descendant[]) => {
    setDirty(true);
    debouncedSave(val);
    setSlashMenu(null);
    setColorPopover(null);
  };

  const resolveRootBlockPath = useCallback(
    (rootBlockElement: SlateElement): Path | null => {
      try {
        const p = ReactEditor.findPath(editor as ReactEditor, rootBlockElement);
        if (p.length !== 1) return null;
        Node.get(editor, p);
        return p;
      } catch {
        return null;
      }
    },
    [editor],
  );

  const openSlashMenu = useCallback(
    (rootBlockElement: SlateElement) => {
      ReactEditor.focus(editor);
      const blockPath = resolveRootBlockPath(rootBlockElement);
      if (!blockPath) return;
      try {
        Transforms.select(editor, SlateEditor.start(editor, blockPath));
      } catch {
        return;
      }
      const state = createSlashMenuStateFromButton(editor, blockPath, "");
      if (state) {
        setSlashMenu(state);
        setSlashIndex(0);
      }
    },
    [editor, resolveRootBlockPath],
  );

  const openColorPopover = useCallback(
    (rootBlockElement: SlateElement, anchorEl: HTMLElement) => {
      ReactEditor.focus(editor);
      const blockPath = resolveRootBlockPath(rootBlockElement);
      if (blockPath) {
        try {
          const range = SlateEditor.range(editor, blockPath);
          Transforms.select(editor, range);
        } catch {
          /* ignore */
        }
      }
      setColorPopover({ anchorRect: anchorEl.getBoundingClientRect() });
    },
    [editor, resolveRootBlockPath],
  );

  const handleMoveRootBlockBefore = useCallback(
    (fromIndex: number, beforeIndex: number) => {
      if (moveRootBlockBefore(editor, fromIndex, beforeIndex)) {
        ReactEditor.focus(editor);
      }
    },
    [editor],
  );

  const blockChromeValue = useMemo(
    () => ({
      pageId: page.id,
      openSlashMenu,
      openColorPopover,
      moveRootBlockBefore: handleMoveRootBlockBefore,
    }),
    [
      page.id,
      openSlashMenu,
      openColorPopover,
      handleMoveRootBlockBefore,
    ],
  );

  const updateSlashFilter = useCallback(
    (filter: string) => {
      setSlashMenu((prev) => {
        if (!prev) return prev;
        const next = createSlashMenuStateFromButton(
          editor,
          prev.blockPath,
          filter,
        );
        return next ?? prev;
      });
    },
    [editor],
  );

  useEffect(() => {
    if (!slashMenu) return;
    const closeIfOutsideMenu = (e: PointerEvent) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.closest("[data-slash-command-menu]")) return;
      setSlashMenu(null);
    };
    const raf = requestAnimationFrame(() => {
      document.addEventListener("pointerdown", closeIfOutsideMenu, true);
    });

    const isTypingInEditor = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return (
        target.isContentEditable ||
        Boolean(target.closest('[contenteditable="true"]'))
      );
    };

    const onKey = (e: globalThis.KeyboardEvent) => {
      const menu = slashMenuRef.current;
      if (!menu) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setSlashMenu(null);
        return;
      }

      if (isTypingInEditor(e.target)) {
        return;
      }

      const n = menu.selectableRowIndices.length;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (n > 0) {
          setSlashIndex((i) => Math.min(i + 1, n - 1));
        }
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (n > 0) {
          setSlashIndex((i) => Math.max(i - 1, 0));
        }
        return;
      }
      if (e.key === "Enter") {
        if (n <= 0) return;
        e.preventDefault();
        const order = slashIndexRef.current;
        const rowIdx = menu.selectableRowIndices[order];
        const row = rowIdx !== undefined ? menu.rows[rowIdx] : undefined;
        if (row?.kind === "block") {
          applySlashCommand(editor, menu, row.type);
          setSlashMenu(null);
          ReactEditor.focus(editor);
        } else if (row?.kind === "javachrist") {
          dismissSlashText(editor, menu);
          setSlashMenu(null);
          runJavaChrist(row.action);
        }
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerdown", closeIfOutsideMenu, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [slashMenu, editor, runJavaChrist]);

  const applySlash = useCallback(
    (blockType: BlockType) => {
      const state = slashMenuRef.current;
      if (!state) return;
      applySlashCommand(editor, state, blockType);
      setSlashMenu(null);
      ReactEditor.focus(editor);
    },
    [editor],
  );

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isHotkey("mod+s", event)) {
      event.preventDefault();
      if ("flush" in debouncedSave) {
        (debouncedSave as any).flush();
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-20 -mx-1 min-h-[2.25rem] bg-background/95 px-1 py-1 backdrop-blur-sm md:static md:bg-transparent md:px-0 md:py-0">
        <SaveStatusLine
          context="editor"
          saving={saving}
          dirty={dirty}
          lastSavedAt={lastSavedAt}
          error={error}
        />
      </div>
      <Slate
        editor={editor}
        initialValue={initialValue}
        onValueChange={handleChange}
      >
        <EditorBlockChromeContext.Provider value={blockChromeValue}>
        <details className="rounded-lg border border-border bg-card/40 md:hidden">
          <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
            JavaChrist & résumé de page
          </summary>
          <div className="space-y-3 border-t border-border p-3">
            <SummarizePageWithJavaChrist pageTitle={page.title} />
            <JavaChristPanel pageTitle={page.title} />
          </div>
        </details>
        <div className="hidden w-full flex-col gap-2 md:flex md:flex-row md:items-start md:justify-between">
          <SummarizePageWithJavaChrist pageTitle={page.title} />
          <div className="flex flex-col items-end gap-2 md:shrink-0">
            <JavaChristPanel pageTitle={page.title} />
          </div>
        </div>
        <div className="relative" onPointerDownCapture={stabilizeDocument}>
          {colorPopover ? (
            <BlockColorPopover
              anchorRect={colorPopover.anchorRect}
              onClose={() => setColorPopover(null)}
            />
          ) : null}
          <SlashCommandMenu
            state={slashMenu}
            selectedSelectableIndex={slashIndex}
            onFilterChange={updateSlashFilter}
            onSelectBlock={applySlash}
            onSelectJavaChrist={(action) => {
              const m = slashMenuRef.current;
              if (m) {
                dismissSlashText(editor, m);
                setSlashMenu(null);
              }
              runJavaChrist(action);
            }}
          />
          <Editable
            decorate={decorate}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Écris ici… Utilise « + » sur chaque ligne pour les blocs ; la palette colore le bloc."
            className="editor-slate min-h-[1.75rem] space-y-1 pl-0 text-base leading-relaxed text-foreground outline-none focus-visible:outline-none md:pl-1"
            aria-label="Contenu de la page"
            spellCheck
            onKeyDown={handleKeyDown}
          />
        </div>
        </EditorBlockChromeContext.Provider>
      </Slate>
    </div>
  );
}

export default function Editor(props: Props) {
  return (
    <JavaChristProvider>
      <EditorInner {...props} />
    </JavaChristProvider>
  );
}
