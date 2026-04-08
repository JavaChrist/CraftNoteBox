import type { BlockType } from "@/types/block";

export const BLOCK_TYPES: BlockType[] = [
  "paragraph",
  "heading1",
  "heading2",
  "heading3",
  "bulleted_list",
  "numbered_list",
  "todo",
  "quote",
  "divider",
  "toggle",
  "code",
];

export const SLASH_LABELS: Record<BlockType, string> = {
  paragraph: "Paragraphe",
  heading1: "Titre 1",
  heading2: "Titre 2",
  heading3: "Titre 3",
  bulleted_list: "Liste à puces",
  numbered_list: "Liste numérotée",
  todo: "À faire",
  quote: "Citation",
  divider: "Séparateur",
  toggle: "Bloc repliable",
  code: "Code",
};

/** Blocs sans contenu éditable (void). */
export const VOID_BLOCK_TYPES = new Set<BlockType>(["divider"]);
