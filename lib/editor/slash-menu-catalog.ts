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
  Type,
  Video,
  Volume2,
} from "lucide-react";
import type { BlockType } from "@/types/block";
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
      Icon: LucideIcon;
    }
  | {
      kind: "soon";
      key: string;
      label: string;
      shortcut?: string;
      Icon: LucideIcon;
      hint: string;
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
  Icon: LucideIcon;
  keywords?: string[];
};

type SoonEntry = {
  action: "soon";
  id: string;
  label: string;
  shortcut?: string;
  Icon: LucideIcon;
  hint: string;
  keywords?: string[];
};

type Section = {
  id: string;
  title: string;
  entries: Array<BlockEntry | SoonEntry>;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Sections façon Notion — seuls les `block` sont insérables ; `soon` = feuille de route MVP. */
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
        action: "soon",
        id: "video",
        label: "Vidéo",
        Icon: Video,
        hint: "Bientôt",
      },
      {
        action: "soon",
        id: "audio",
        label: "Audio",
        Icon: Volume2,
        hint: "Bientôt",
        keywords: ["son"],
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
        action: "soon",
        id: "db-table",
        label: "Vue « table »",
        Icon: Table2,
        hint: "Hors MVP",
        keywords: ["database"],
      },
      {
        action: "soon",
        id: "db-kanban",
        label: "Vue « tableau kanban »",
        Icon: LayoutGrid,
        hint: "Hors MVP",
      },
      {
        action: "soon",
        id: "db-gallery",
        label: "Vue « galerie »",
        Icon: LayoutGrid,
        hint: "Hors MVP",
      },
      {
        action: "soon",
        id: "db-list",
        label: "Vue « liste »",
        Icon: List,
        hint: "Hors MVP",
      },
      {
        action: "soon",
        id: "db-feed",
        label: "Vue du fil d’actualité",
        Icon: Newspaper,
        hint: "Hors MVP",
      },
      {
        action: "soon",
        id: "db-dashboard",
        label: "Vue Tableau de bord",
        Icon: LayoutDashboard,
        hint: "Hors MVP",
      },
      {
        action: "soon",
        id: "db-calendar",
        label: "Vue « calendrier »",
        Icon: Calendar,
        hint: "Hors MVP",
      },
      {
        action: "soon",
        id: "db-timeline",
        label: "Vue « chronologie »",
        Icon: History,
        hint: "Hors MVP",
      },
      {
        action: "soon",
        id: "chart-bar-v",
        label: "Graphique à barres verticales",
        Icon: BarChart3,
        hint: "Hors MVP",
        keywords: ["graphique"],
      },
      {
        action: "soon",
        id: "chart-line",
        label: "Graphique en lignes",
        Icon: LineChart,
        hint: "Hors MVP",
      },
      {
        action: "soon",
        id: "chart-donut",
        label: "Graphique en anneau",
        Icon: PieChart,
        hint: "Hors MVP",
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
        action: "soon",
        id: "page-embed",
        label: "Page",
        Icon: FileText,
        hint: "Bientôt",
        keywords: ["sous page"],
      },
      {
        action: "soon",
        id: "callout",
        label: "Encadré",
        Icon: MessageSquare,
        hint: "Bientôt",
        keywords: ["callout"],
      },
      {
        action: "block",
        type: "quote",
        label: "Citation",
        Icon: Quote,
        keywords: ["blockquote"],
      },
      {
        action: "soon",
        id: "table",
        label: "Tableau",
        Icon: Table2,
        hint: "Bientôt",
      },
      {
        action: "block",
        type: "divider",
        label: "Séparateur",
        Icon: Minus,
        keywords: ["hr", "ligne"],
      },
      {
        action: "soon",
        id: "page-link",
        label: "Lien vers une page",
        Icon: Link2,
        hint: "Bientôt",
      },
    ],
  },
  {
    id: "embed",
    title: "Intégration & import",
    entries: [
      {
        action: "soon",
        id: "integration",
        label: "Intégration",
        Icon: Plug,
        hint: "Bientôt",
        keywords: ["embed", "service"],
      },
      {
        action: "soon",
        id: "import",
        label: "Importation",
        Icon: FileUp,
        hint: "Bientôt",
        keywords: ["fichier", "markdown"],
      },
      {
        action: "soon",
        id: "audio-embed",
        label: "Fichier audio",
        Icon: Mic,
        hint: "Bientôt",
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
          [e.type, e.label, ...(e.keywords ?? [])].join(" "),
        );
        if (!q || haystack.includes(q)) {
          matched.push({
            kind: "block",
            key: `b-${e.type}-${section.id}`,
            type: e.type,
            label: e.label,
            shortcut: e.shortcut,
            Icon: e.Icon,
          });
        }
      } else {
        const haystack = normalize(
          [e.id, e.label, e.hint, ...(e.keywords ?? [])].join(" "),
        );
        if (!q || haystack.includes(q)) {
          matched.push({
            kind: "soon",
            key: `s-${e.id}`,
            label: e.label,
            shortcut: e.shortcut,
            Icon: e.Icon,
            hint: e.hint,
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
      if (r.kind === "block") {
        selectableRowIndices.push(rows.length - 1);
      }
    }
  }

  return { rows, selectableRowIndices };
}
