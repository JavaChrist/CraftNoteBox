"use client";

import { createContext, useContext } from "react";
import type { Element as SlateElement } from "slate";

export type EditorBlockChromeContextValue = {
  /** Page en cours d’édition (uploads média, etc.). */
  pageId: string;
  /** Résout le chemin au clic (évite les paths obsolètes après normalisation Slate). */
  openSlashMenu: (rootBlockElement: SlateElement) => void;
  openColorPopover: (
    rootBlockElement: SlateElement,
    anchorEl: HTMLElement,
  ) => void;
  /** Réordonne un bloc racine : le placer avant l’index `beforeIndex` (0…n). */
  moveRootBlockBefore: (fromIndex: number, beforeIndex: number) => void;
};

export const EditorBlockChromeContext =
  createContext<EditorBlockChromeContextValue | null>(null);

export function useEditorBlockChrome() {
  return useContext(EditorBlockChromeContext);
}
