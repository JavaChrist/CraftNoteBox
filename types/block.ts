/**
 * Types de blocs persistés (une ligne = un nœud racine dans l’éditeur Slate).
 */
export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulleted_list"
  | "numbered_list"
  | "todo"
  | "quote"
  | "divider"
  | "toggle"
  | "code";
