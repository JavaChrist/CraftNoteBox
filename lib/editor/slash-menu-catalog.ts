import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bookmark,
  History,
  LineChart,
  PieChart,
  Calendar,
  ChevronsDownUp,
  Code2,
  FileText,
  FileUp,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutGrid,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  MessageSquare,
  Mic,
  Minus,
  Newspaper,
  Sparkles,
  Paperclip,
  Plug,
  Quote,
  Table2,
  TextCursorInput,
  Type,
  Video,
  Volume2,
} from "lucide-react";
import type { BlockType, SlashBlockPreset } from "@/types/block";
import type { AiAction } from "@/lib/ai/types";
import { filterJavaChristMenuEntries } from "@/lib/ai/actions";

export type SlashMenuRow =
  | { kind: "heading"; key: string; title: string }
  | {
      kind: "block";
      key: string;
      type: BlockType;
      label: string;
      shortcut?: string;
      preset?: SlashBlockPreset;
      Icon: LucideIcon;
    }
  | {
      kind: "command";
      key: string;
      command: "import";
      label: string;
      Icon: LucideIcon;
    }
  | {
      kind: "javachrist";
      key: string;
      action: AiAction;
      label: string;
      shortcut?: string;
      description: string;
      Icon: LucideIcon;
    };

type BlockEntry = {
  action: "block";
  type: BlockType;
  label: string;
  shortcut?: string;
  preset?: SlashBlockPreset;
  Icon: LucideIcon;
  keywords?: string[];
};

type CommandEntry = {
  action: "command";
  id: "import";
  label: string;
  Icon: LucideIcon;
  keywords?: string[];
};

type Section = {
  id: string;
  title: string;
  entries: Array<BlockEntry | CommandEntry>;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Sections façon Notion — chaque entrée insère un bloc ou lance une commande. */
export const SLASH_MENU_SECTIONS: Section[] = [
  {
    id: "basic",
    title: "Blocs de base",
    entries: [
      {
        action: "block",
        type: "paragraph",
        label: "Texte",
        shortcut: "texte",
        Icon: Type,
        keywords: ["paragraphe", "text"],
      },
      {
        action: "block",
        type: "heading1",
        label: "Titre 1",
        shortcut: "#",
        Icon: Heading1,
        keywords: ["h1", "titre"],
      },
      {
        action: "block",
        type: "heading2",
        label: "Titre 2",
        shortcut: "##",
        Icon: Heading2,
        keywords: ["h2"],
      },
      {
        action: "block",
        type: "heading3",
        label: "Titre 3",
        shortcut: "###",
        Icon: Heading3,
        keywords: ["h3"],
      },
      {
        action: "block",
        type: "text_zone",
        label: "Zone de texte",
        Icon: TextCursorInput,
        keywords: ["coller", "paste", "textarea", "paragraphe", "texte long"],
      },
      {
        action: "block",
        type: "bulleted_list",
        label: "Liste à puces",
        shortcut: "-",
        Icon: List,
        keywords: ["puce", "bullet"],
      },
      {
        action: "block",
        type: "numbered_list",
        label: "Liste numérotée",
        shortcut: "1.",
        Icon: ListOrdered,
        keywords: ["numero", "ordered"],
      },
      {
        action: "block",
        type: "todo",
        label: "Liste de tâches",
        shortcut: "[]",
        Icon: ListTodo,
        keywords: ["checkbox", "todo", "faire"],
      },
    ],
  },
  {
    id: "media",
    title: "Média",
    entries: [
      {
        action: "block",
        type: "image",
        label: "Image",
        Icon: ImageIcon,
        keywords: ["photo", "img"],
      },
      {
        action: "block",
        type: "video",
        label: "Vidéo",
        Icon: Video,
        keywords: ["youtube", "vimeo", "mp4"],
      },
      {
        action: "block",
        type: "audio",
        label: "Audio",
        Icon: Volume2,
        keywords: ["son", "mp3"],
      },
      {
        action: "block",
        type: "code",
        label: "Code",
        Icon: Code2,
        keywords: ["snippet", "bloc"],
      },
      {
        action: "block",
        type: "file",
        label: "Fichier",
        Icon: Paperclip,
        keywords: ["piece jointe", "upload"],
      },
      {
        action: "block",
        type: "bookmark",
        label: "Aperçu de lien Web",
        Icon: Bookmark,
        keywords: ["embed", "lien", "url"],
      },
    ],
  },
  {
    id: "database",
    title: "Base de données",
    entries: [
      {
        action: "block",
        type: "database",
        preset: { view: "table" },
        label: "Vue « table »",
        Icon: Table2,
        keywords: ["database", "base"],
      },
      {
        action: "block",
        type: "database",
        preset: { view: "kanban" },
        label: "Vue « tableau kanban »",
        Icon: LayoutGrid,
        keywords: ["kanban"],
      },
      {
        action: "block",
        type: "database",
        preset: { view: "gallery" },
        label: "Vue « galerie »",
        Icon: LayoutGrid,
        keywords: ["galerie"],
      },
      {
        action: "block",
        type: "database",
        preset: { view: "list" },
        label: "Vue « liste »",
        Icon: List,
        keywords: ["liste"],
      },
      {
        action: "block",
        type: "database",
        preset: { view: "feed" },
        label: "Vue du fil d’actualité",
        Icon: Newspaper,
        keywords: ["fil", "feed"],
      },
      {
        action: "block",
        type: "database",
        preset: { view: "dashboard" },
        label: "Vue Tableau de bord",
        Icon: LayoutDashboard,
        keywords: ["dashboard"],
      },
      {
        action: "block",
        type: "database",
        preset: { view: "calendar" },
        label: "Vue « calendrier »",
        Icon: Calendar,
        keywords: ["calendrier"],
      },
      {
        action: "block",
        type: "database",
        preset: { view: "timeline" },
        label: "Vue « chronologie »",
        Icon: History,
        keywords: ["timeline", "chronologie"],
      },
      {
        action: "block",
        type: "chart",
        preset: { chartKind: "bar" },
        label: "Graphique à barres verticales",
        Icon: BarChart3,
        keywords: ["graphique", "barres"],
      },
      {
        action: "block",
        type: "chart",
        preset: { chartKind: "line" },
        label: "Graphique en lignes",
        Icon: LineChart,
        keywords: ["graphique", "ligne"],
      },
      {
        action: "block",
        type: "chart",
        preset: { chartKind: "donut" },
        label: "Graphique en anneau",
        Icon: PieChart,
        keywords: ["graphique", "anneau", "donut"],
      },
    ],
  },
  {
    id: "advanced",
    title: "Blocs avancés",
    entries: [
      {
        action: "block",
        type: "toggle",
        label: "Menu dépliant",
        Icon: ChevronsDownUp,
        keywords: ["repliable", "toggle"],
      },
      {
        action: "block",
        type: "page_embed",
        label: "Page",
        Icon: FileText,
        keywords: ["sous page", "embed"],
      },
      {
        action: "block",
        type: "callout",
        label: "Encadré",
        Icon: MessageSquare,
        keywords: ["callout", "encadre"],
      },
      {
        action: "block",
        type: "quote",
        label: "Citation",
        Icon: Quote,
        keywords: ["blockquote"],
      },
      {
        action: "block",
        type: "table",
        label: "Tableau",
        Icon: Table2,
        keywords: ["table", "grille"],
      },
      {
        action: "block",
        type: "divider",
        label: "Séparateur",
        Icon: Minus,
        keywords: ["hr", "ligne"],
      },
      {
        action: "block",
        type: "page_link",
        label: "Lien vers une page",
        Icon: Link2,
        keywords: ["mention", "lien interne"],
      },
    ],
  },
  {
    id: "embed",
    title: "Intégration & import",
    entries: [
      {
        action: "block",
        type: "embed",
        label: "Intégration",
        Icon: Plug,
        keywords: ["embed", "service", "youtube", "figma", "spotify"],
      },
      {
        action: "command",
        id: "import",
        label: "Importation",
        Icon: FileUp,
        keywords: ["fichier", "markdown", "csv", "texte"],
      },
      {
        action: "block",
        type: "audio",
        label: "Fichier audio",
        Icon: Mic,
        keywords: ["audio", "micro", "son"],
      },
    ],
  },
];

export function buildSlashMenuRows(filterRaw: string): {
  rows: SlashMenuRow[];
  selectableRowIndices: number[];
} {
  const q = normalize(filterRaw.trim());
  const rows: SlashMenuRow[] = [];
  const selectableRowIndices: number[] = [];

  const jcMatched = filterJavaChristMenuEntries(q);
  if (jcMatched.length > 0) {
    rows.push({
      kind: "heading",
      key: "h-javachrist",
      title: "JavaChrist",
    });
    for (const e of jcMatched) {
      rows.push({
        kind: "javachrist",
        key: `jc-${e.action}`,
        action: e.action,
        label: e.label,
        shortcut: e.shortcut,
        description: e.description,
        Icon: Sparkles,
      });
      selectableRowIndices.push(rows.length - 1);
    }
  }

  for (const section of SLASH_MENU_SECTIONS) {
    const matched: SlashMenuRow[] = [];

    for (const e of section.entries) {
      if (e.action === "block") {
        const haystack = normalize(
          [e.type, e.label, e.preset?.view ?? "", e.preset?.chartKind ?? "", ...(e.keywords ?? [])].join(" "),
        );
        if (!q || haystack.includes(q)) {
          matched.push({
            kind: "block",
            key: `b-${e.type}-${e.preset?.view ?? e.preset?.chartKind ?? "default"}-${section.id}`,
            type: e.type,
            label: e.label,
            shortcut: e.shortcut,
            preset: e.preset,
            Icon: e.Icon,
          });
        }
      } else {
        const haystack = normalize(
          [e.id, e.label, ...(e.keywords ?? [])].join(" "),
        );
        if (!q || haystack.includes(q)) {
          matched.push({
            kind: "command",
            key: `c-${e.id}`,
            command: e.id,
            label: e.label,
            Icon: e.Icon,
          });
        }
      }
    }

    if (matched.length === 0) continue;

    rows.push({
      kind: "heading",
      key: `h-${section.id}`,
      title: section.title,
    });
    for (const r of matched) {
      rows.push(r);
      if (r.kind === "block" || r.kind === "command") {
        selectableRowIndices.push(rows.length - 1);
      }
    }
  }

  return { rows, selectableRowIndices };
}
