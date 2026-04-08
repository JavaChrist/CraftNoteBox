import type { BlockType } from "@/types/block";
import { BLOCK_TYPES } from "@/lib/editor/block-types";

export { BLOCK_TYPES };

export const defaultContent = [
  {
    type: "paragraph" as const,
    children: [{ text: "" }],
  },
];

type SlateNode = {
  type: string;
  children: unknown[];
  checked?: boolean;
  open?: boolean;
};

export function createDefaultBlock(type: BlockType): SlateNode {
  switch (type) {
    case "divider":
      return { type: "divider", children: [{ text: "" }] };
    case "toggle":
      return {
        type: "toggle",
        open: true,
        children: [{ type: "paragraph", children: [{ text: "" }] }],
      };
    case "todo":
      return { type: "todo", checked: false, children: [{ text: "" }] };
    case "numbered_list":
    case "bulleted_list":
    case "quote":
    case "code":
    case "heading1":
    case "heading2":
    case "heading3":
    case "paragraph":
      return { type, children: [{ text: "" }] };
    default:
      return { type: "paragraph", children: [{ text: "" }] };
  }
}
