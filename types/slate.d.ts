import type { BaseEditor } from "slate";
import type { ReactEditor } from "slate-react";
import type { HistoryEditor } from "slate-history";
import type { BlockType } from "./block";

export type SlateText = { text: string };

export type SlateBlockElement = {
  type: BlockType;
  children: (SlateBlockElement | SlateText)[];
  checked?: boolean;
  open?: boolean;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: SlateBlockElement;
    Text: SlateText;
  }
}
