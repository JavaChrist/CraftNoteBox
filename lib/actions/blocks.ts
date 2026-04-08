"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "../supabase/service";
import { supabaseToError } from "../supabase/to-error";
import { requireUser } from "../auth/session";
import type { Block, BlockType } from "../db/types";

type BlockRow = {
  id: string;
  page_id: string;
  user_id: string;
  type: string;
  content: unknown;
  order_index: number;
  created_at: string;
  updated_at: string;
};

function rowToBlock(row: BlockRow): Block {
  return {
    id: row.id,
    pageId: row.page_id,
    userId: row.user_id,
    type: row.type as BlockType,
    content: row.content,
    orderIndex: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function assertPageOwnership(pageId: string, uid: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("pages")
    .select("user_id")
    .eq("id", pageId)
    .maybeSingle();

  if (error) throw supabaseToError(error);
  if (!data) throw new Error("Page introuvable");
  if ((data as { user_id: string }).user_id !== uid) {
    throw new Error("Accès refusé");
  }
}

export async function listBlocks(pageId: string): Promise<Block[]> {
  const user = await requireUser();
  await assertPageOwnership(pageId, user.uid);

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("blocks")
    .select("*")
    .eq("page_id", pageId)
    .order("order_index", { ascending: true });

  if (error) throw supabaseToError(error);
  return (data as BlockRow[]).map(rowToBlock);
}

export async function upsertBlocks(
  pageId: string,
  blocks: Array<{
    id?: string;
    type: BlockType;
    content: unknown;
    orderIndex: number;
  }>,
): Promise<Block[]> {
  const user = await requireUser();
  await assertPageOwnership(pageId, user.uid);

  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  for (const block of blocks) {
    if (block.id) {
      const { error } = await supabase
        .from("blocks")
        .update({
          type: block.type,
          content: block.content,
          order_index: block.orderIndex,
          updated_at: now,
        })
        .eq("id", block.id)
        .eq("page_id", pageId)
        .eq("user_id", user.uid);

      if (error) throw supabaseToError(error);
    } else {
      const { error } = await supabase.from("blocks").insert({
        page_id: pageId,
        user_id: user.uid,
        type: block.type,
        content: block.content,
        order_index: block.orderIndex,
        created_at: now,
        updated_at: now,
      });

      if (error) throw supabaseToError(error);
    }
  }

  revalidatePath(`/pages/${pageId}`);

  const { data, error } = await supabase
    .from("blocks")
    .select("*")
    .eq("page_id", pageId)
    .order("order_index", { ascending: true });

  if (error) throw supabaseToError(error);
  return (data as BlockRow[]).map(rowToBlock);
}

export async function deleteBlock(blockId: string) {
  const user = await requireUser();
  const supabase = createServiceRoleClient();

  const { data, error: fetchErr } = await supabase
    .from("blocks")
    .select("page_id")
    .eq("id", blockId)
    .maybeSingle();

  if (fetchErr) throw supabaseToError(fetchErr);
  if (!data) return;

  const pageId = (data as { page_id: string }).page_id;
  await assertPageOwnership(pageId, user.uid);

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("id", blockId)
    .eq("user_id", user.uid);

  if (error) throw supabaseToError(error);
  revalidatePath(`/pages/${pageId}`);
}
