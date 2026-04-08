export const AI_ACTIONS = [
  "summarize",
  "reformulate",
  "checklist",
  "plan",
  "improve",
  "meeting_notes",
  "titles",
] as const;

export type AiAction = (typeof AI_ACTIONS)[number];

export type AiSelectionMode = "auto" | "full_page" | "current_block";

export function isAiAction(v: unknown): v is AiAction {
  return typeof v === "string" && (AI_ACTIONS as readonly string[]).includes(v);
}
