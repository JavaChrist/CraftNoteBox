import type { BaseEditor } from "slate";
import type { ReactEditor } from "slate-react";
import type { HistoryEditor } from "slate-history";
import type { BlockType } from "./block";

export type SlateText = { text: string; color?: string };

export type SlateBlockElement = {
  type: BlockType;
  children: (SlateBlockElement | SlateText)[];
  checked?: boolean;
  open?: boolean;
  /** Bloc `code` uniquement — identifiant de langage (liste `code-languages`). */
  language?: string;
  /** Bloc `image` — URL affichée ; `alt` optionnel. */
  url?: string;
  alt?: string;
  /** Bloc `file` — lien de téléchargement et nom affiché. */
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  /** Bloc `bookmark` — aperçu Open Graph mis en cache dans le nœud. */
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogSiteName?: string;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: SlateBlockElement;
    Text: SlateText;
  }
}
