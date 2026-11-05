import type { BlockType, SlashBlockPreset } from "@/types/block";

export type { BlockType, SlashBlockPreset };

/**
 * Identifiant de rubrique (`pages.scope`).
 * Les cinq rubriques d’origine ont un slug fixe ; les autres sont créées par l’utilisateur.
 */
export type PageScope = string;

/** Rubrique affichée dans la barre latérale. */
export type PageSection = {
  id: string;
  userId: string;
  slug: string;
  title: string;
  shortLabel: string;
  sortOrder: number;
  builtin: boolean;
  /** `false` tant que la ligne n’existe pas en base (repli ou rubrique orpheline). */
  persisted: boolean;
};

export type Block = {
  id: string;
  pageId: string;
  userId: string;
  type: BlockType;
  content: unknown;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type Page = {
  id: string;
  userId: string;
  title: string;
  icon?: string | null;
  parentId?: string | null;
  scope: PageScope;
  createdAt: string;
  updatedAt: string;
  blocks?: Block[];
};

