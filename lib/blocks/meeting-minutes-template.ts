import type { BlockType } from "@/types/block";

/**
 * Nœuds racine Slate persistés tels qu’en base (colonne `blocks.content`).
 */
export type InitialBlockSeed = {
  type: BlockType;
  content: Record<string, unknown>;
};

function paragraph(text: string): InitialBlockSeed {
  return {
    type: "paragraph",
    content: { type: "paragraph", children: [{ text: text }] },
  };
}

function heading(level: 1 | 2, text: string): InitialBlockSeed {
  const type = level === 1 ? "heading1" : "heading2";
  return {
    type,
    content: { type, children: [{ text }] },
  };
}

function emptyBulletedItem(): InitialBlockSeed {
  return {
    type: "bulleted_list",
    content: { type: "bulleted_list", children: [{ text: "" }] },
  };
}

function emptyTodo(): InitialBlockSeed {
  return {
    type: "todo",
    content: {
      type: "todo",
      checked: false,
      children: [{ text: "" }],
    },
  };
}

/**
 * Blocs initiaux pour une page « Compte rendu » de réunion.
 * `meetingTitle` et `dateTimeLabel` sont du texte affiché (ex. libellé date/heure localisé).
 */
export function buildMeetingMinutesBlockSeeds(
  meetingTitle: string,
  dateTimeLabel: string,
): InitialBlockSeed[] {
  return [
    heading(1, meetingTitle),
    paragraph(dateTimeLabel),
    heading(2, "Contexte"),
    paragraph(""),
    heading(2, "Participants"),
    emptyBulletedItem(),
    heading(2, "Points abordés"),
    emptyBulletedItem(),
    heading(2, "Décisions"),
    emptyBulletedItem(),
    heading(2, "Actions"),
    emptyTodo(),
  ];
}
