import type { BlockType, SlashBlockPreset } from "@/types/block";

export type { BlockType, SlashBlockPreset };

/** Rubrique d’une page. L’éditeur et l’URL restent les mêmes. */
export type PageScope =
  | "private"
  | "pro"
  | "projets"
  | "sauvegardes"
  | "applications";

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

