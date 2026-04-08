"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent } from "react";
import { createEditor, Descendant, Editor as SlateEditor } from "slate";
import { withHistory } from "slate-history";
import {
  Editable,
  Slate,
  withReact,
  type RenderLeafProps,
} from "slate-react";
import isHotkey from "is-hotkey";
import Element from "./Element";
import SlashCommandMenu from "./SlashCommandMenu";
import {
  applySlashCommand,
  computeSlashMenuState,
  dismissSlashText,
  type SlashMenuState,
} from "@/lib/editor/slash-commands";
import { createAutosave } from "@/lib/utils/autosave";
import type { Block, BlockType, Page } from "@/lib/db/types";
import { SaveStatusLine } from "@/components/ui/save-status-line";
import { withBlockEditor } from "@/lib/editor/transforms";
import { blocksToSlateValue } from "@/lib/editor/slate-value";
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

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return (
      <span {...props.attributes} className="text-foreground">
        {props.children}
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

  const refreshSlashMenu = useCallback(() => {
    queueMicrotask(() => {
      const next = computeSlashMenuState(editor);
      setSlashMenu(next);
      setSlashIndex(0);
    });
  }, [editor]);

  const handleChange = (val: Descendant[]) => {
    setDirty(true);
    debouncedSave(val);
    refreshSlashMenu();
  };

  const applySlash = useCallback(
    (blockType: BlockType) => {
      const state = slashMenuRef.current;
      if (!state) return;
      applySlashCommand(editor, state, blockType);
      setSlashMenu(null);
    },
    [editor],
  );

  const handleKeyDown = (event: KeyboardEvent) => {
    const menu = slashMenuRef.current;

    if (menu && menu.rows.length > 0) {
      const n = menu.selectableRowIndices.length;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (n > 0) {
          setSlashIndex((i) => Math.min(i + 1, n - 1));
        }
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (n > 0) {
          setSlashIndex((i) => Math.max(i - 1, 0));
        }
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        if (n > 0) {
          const order = slashIndexRef.current;
          const rowIdx = menu.selectableRowIndices[order];
          const row = rowIdx !== undefined ? menu.rows[rowIdx] : undefined;
          if (row?.kind === "block") {
            applySlash(row.type);
          } else if (row?.kind === "javachrist") {
            dismissSlashText(editor, menu);
            setSlashMenu(null);
            runJavaChrist(row.action);
          }
        }
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        dismissSlashText(editor, menu);
        setSlashMenu(null);
        return;
      }
    }

    if (isHotkey("mod+s", event)) {
      event.preventDefault();
      if ("flush" in debouncedSave) {
        (debouncedSave as any).flush();
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="min-h-[2.25rem]">
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
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <SummarizePageWithJavaChrist pageTitle={page.title} />
          <div className="flex flex-col items-end gap-2 sm:shrink-0">
            <JavaChristPanel pageTitle={page.title} />
          </div>
        </div>
        <div className="relative" onPointerDownCapture={stabilizeDocument}>
          <SlashCommandMenu
            state={slashMenu}
            selectedSelectableIndex={slashIndex}
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
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Écris ici… « / » pour blocs et JavaChrist (ex. /résumé, /javachrist)."
            className="min-h-[1.75rem] space-y-1 text-base leading-relaxed text-foreground outline-none focus-visible:outline-none"
            aria-label="Contenu de la page"
            spellCheck
            onKeyDown={handleKeyDown}
          />
        </div>
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
