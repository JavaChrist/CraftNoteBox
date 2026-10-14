/**
 * Types de blocs persistés (une ligne = un nœud racine dans l’éditeur Slate).
 */
export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "text_zone"
  | "bulleted_list"
  | "numbered_list"
  | "todo"
  | "quote"
  | "divider"
  | "toggle"
  | "code"
  | "image"
  | "file"
  | "bookmark"
  | "video"
  | "audio"
  | "callout"
  | "table"
  | "page_link"
  | "page_embed"
  | "embed"
  | "database"
  | "chart";

export type CalloutTone = "note" | "info" | "success" | "warning" | "danger";

export type DbColumnKind = "text" | "number" | "date" | "select";

export type DbView =
  | "table"
  | "kanban"
  | "gallery"
  | "list"
  | "feed"
  | "dashboard"
  | "calendar"
  | "timeline";

export type DbColumn = {
  id: string;
  name: string;
  kind: DbColumnKind;
  options?: string[];
};

export type DbRow = {
  id: string;
  cells: Record<string, string>;
};

export type ChartKind = "bar" | "line" | "donut";

export type ChartPoint = {
  label: string;
  value: number;
};

/** Réglage initial choisi dans le menu slash (vue ou type de graphique). */
export type SlashBlockPreset = {
  view?: DbView;
  chartKind?: ChartKind;
};
