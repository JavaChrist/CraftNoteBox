import { Editor, Text, Transforms, type Editor as EditorType } from "slate";

/** Couleurs sûres pour le stockage (évite injection CSS arbitraire). */
const HEX6 = /^#[0-9A-Fa-f]{6}$/;
const HEX3 = /^#[0-9A-Fa-f]{3}$/;

export function isAllowedTextColor(value: string): boolean {
  const v = value.trim();
  return HEX6.test(v) || HEX3.test(v);
}

export const TEXT_COLOR_PRESETS: ReadonlyArray<{
  key: string;
  label: string;
  hex: string;
}> = [
  { key: "red", label: "Rouge", hex: "#dc2626" },
  { key: "orange", label: "Orange", hex: "#ea580c" },
  { key: "amber", label: "Ambre", hex: "#ca8a04" },
  { key: "green", label: "Vert", hex: "#16a34a" },
  { key: "blue", label: "Bleu", hex: "#2563eb" },
  { key: "indigo", label: "Indigo", hex: "#4f46e5" },
  { key: "purple", label: "Violet", hex: "#9333ea" },
  { key: "pink", label: "Rose", hex: "#db2777" },
  { key: "slate", label: "Gris", hex: "#64748b" },
];

export function setTextColor(editor: EditorType, color: string | null): void {
  if (!editor.selection) return;

  if (color == null || color === "") {
    Transforms.unsetNodes(editor, "color", {
      match: (n) => Text.isText(n),
      split: true,
    });
    return;
  }

  if (!isAllowedTextColor(color)) return;

  Transforms.setNodes(
    editor,
    { color: color.trim() },
    { match: (n) => Text.isText(n), split: true },
  );
}

/** Couleur aux bornes de la sélection (curseur ou premier segment sélectionné). */
export function getActiveTextColor(editor: EditorType): string | undefined {
  const marks = Editor.marks(editor) as { color?: unknown } | null;
  if (marks && typeof marks.color === "string" && isAllowedTextColor(marks.color)) {
    return marks.color;
  }
  return undefined;
}
