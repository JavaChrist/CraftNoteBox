import type { BlockType } from "@/types/block";

export type { BlockType };

/** Pages privées (sidebar) vs pages PRO (même éditeur et routes `/pages/[id]`). */
export type PageScope = "private" | "pro";

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

