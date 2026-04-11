import type { BlockType } from "@/types/block";
import { DEFAULT_CODE_LANGUAGE } from "@/lib/editor/code-languages";
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
  language?: string;
  url?: string;
  alt?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogSiteName?: string;
};

export function createDefaultBlock(type: BlockType): SlateNode {
  switch (type) {
    case "divider":
      return { type: "divider", children: [{ text: "" }] };
    case "image":
      return {
        type: "image",
        url: "",
        alt: "",
        children: [{ text: "" }],
      };
    case "file":
      return {
        type: "file",
        url: "",
        fileName: "",
        children: [{ text: "" }],
      };
    case "bookmark":
      return {
        type: "bookmark",
        url: "",
        children: [{ text: "" }],
      };
    case "toggle":
      return {
        type: "toggle",
        open: true,
        children: [{ type: "paragraph", children: [{ text: "" }] }],
      };
    case "todo":
      return { type: "todo", checked: false, children: [{ text: "" }] };
    case "code":
      return {
        type: "code",
        language: DEFAULT_CODE_LANGUAGE,
        children: [{ text: "" }],
      };
    case "numbered_list":
    case "bulleted_list":
    case "quote":
    case "heading1":
    case "heading2":
    case "heading3":
    case "paragraph":
      return { type, children: [{ text: "" }] };
    default:
      return { type: "paragraph", children: [{ text: "" }] };
  }
}
