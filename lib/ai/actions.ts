import type { AiAction } from "./types";

export type JavaChristMenuEntry = {
  action: AiAction;
  /** Libellé court dans les menus */
  label: string;
  description: string;
  /** Raccourci affiché (slash sans /) */
  shortcut?: string;
  /** Mots-clés pour filtrer le slash menu (normalisés côté catalogue) */
  keywords: string[];
};

/** Données UI + slash — pas de dépendance aux types Slate du menu. */
export const JAVACHRIST_MENU_ENTRIES: JavaChristMenuEntry[] = [
  {
    action: "summarize",
    label: "Résumé",
    description: "Résumer la sélection ou la page",
    shortcut: "résumé",
    keywords: [
      "resume",
      "résumé",
      "resumé",
      "summarize",
      "javachrist",
      "jc",
      "ai",
    ],
  },
  {
    action: "reformulate",
    label: "Reformuler",
    description: "Texte plus fluide et professionnel",
    shortcut: "reformuler",
    keywords: ["reformuler", "reformulation", "rewrite"],
  },
  {
    action: "checklist",
    label: "Checklist",
    description: "Tâches concrètes (blocs à cocher)",
    shortcut: "checklist",
    keywords: ["checklist", "liste", "taches", "tâches", "todo"],
  },
  {
    action: "plan",
    label: "Plan structuré",
    description: "Titres et sous-parties",
    shortcut: "plan",
    keywords: ["plan", "structure", "outline"],
  },
  {
    action: "improve",
    label: "Améliorer",
    description: "Plus clair et agréable à lire",
    shortcut: "améliorer",
    keywords: ["ameliorer", "améliorer", "enrichir", "clarifier"],
  },
  {
    action: "meeting_notes",
    label: "Compte rendu",
    description: "Notes brutes → compte rendu de réunion",
    shortcut: "compte-rendu",
    keywords: [
      "compte-rendu",
      "compte rendu",
      "meeting",
      "reunion",
      "réunion",
      "crd",
    ],
  },
  {
    action: "titles",
    label: "Titres",
    description: "Titre + sous-titres proposés",
    shortcut: "titres",
    keywords: ["titres", "titre", "headings", "soustitres"],
  },
];

/** Déclenche l’affichage de toutes les entrées JavaChrist dans le slash. */
const JAVACHRIST_BROAD_KEYS = [
  "javachrist",
  "javachris",
  "javach",
  "javac",
  "java",
  "jc",
  "ai",
];

function normKey(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** `normalizedFilter` = même normalisation que le slash menu (`normalize()` du catalogue). */
export function filterJavaChristMenuEntries(normalizedFilter: string): JavaChristMenuEntry[] {
  const q = normalizedFilter.trim();
  if (!q) return [];

  const broad = JAVACHRIST_BROAD_KEYS.some((k) => {
    const nk = normKey(k);
    return q.includes(nk) || nk.startsWith(q) || q.startsWith(nk);
  });
  if (broad) return [...JAVACHRIST_MENU_ENTRIES];

  return JAVACHRIST_MENU_ENTRIES.filter((e) => {
    const hay = normKey(
      [e.label, e.description, e.shortcut, ...e.keywords].filter(Boolean).join(" "),
    );
    if (hay.includes(q)) return true;
    return e.keywords.some((k) => {
      const nk = normKey(k);
      return nk.startsWith(q) || q.startsWith(nk) || nk.includes(q);
    });
  });
}
