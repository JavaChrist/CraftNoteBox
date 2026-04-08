import type { AiAction } from "./types";

const BASE =
  "Tu réponds en français, ton sobre et professionnel. N’invente pas de faits. Pour les sorties structurées, utilise des lignes au format Markdown simple : " +
  "lignes « # », « ## », « ### » pour les titres, « - texte » pour les puces, « - [ ] tâche » pour les cases à cocher (non cochées), « ``` » pour un bloc de code sur plusieurs lignes. " +
  "Une instruction par ligne pour les listes. Pas de HTML.";

export const AI_ACTION_LABELS: Record<
  AiAction,
  { label: string; description: string }
> = {
  summarize: {
    label: "Résumé",
    description: "Contenu clair, concis et structuré",
  },
  reformulate: {
    label: "Reformuler",
    description: "Fluide, claire, professionnelle — même sens",
  },
  checklist: {
    label: "Checklist",
    description: "Actions concrètes, une tâche par ligne (- [ ])",
  },
  plan: {
    label: "Plan structuré",
    description: "Titres et sous-parties (# / ## / ###)",
  },
  improve: {
    label: "Améliorer",
    description: "Plus clair, mieux structuré, plus lisible",
  },
  meeting_notes: {
    label: "Compte rendu",
    description: "Notes brutes → compte rendu exploitable",
  },
  titles: {
    label: "Titres",
    description: "Titre principal + sous-titres proposés",
  },
};

const USER_INSTRUCTIONS: Record<AiAction, string> = {
  summarize:
    "Résume le contenu de manière claire, concise et structurée. Utilise des paragraphes ou des puces « - » si pertinent.",
  reformulate:
    "Reformule ce texte de manière fluide, claire et professionnelle, sans changer le sens ni les faits.",
  checklist:
    "Transforme ce contenu en checklist d’actions concrètes, une ligne par tâche, chaque ligne au format « - [ ] … ».",
  plan: "Transforme ce contenu en plan structuré avec titres et sous-parties, en utilisant « # », « ## » et « ### ».",
  improve:
    "Améliore ce contenu en le rendant plus clair, mieux structuré et plus agréable à lire, sans ajouter d’informations non présentes dans le texte source.",
  meeting_notes:
    "Transforme ces notes brutes en compte rendu de réunion clair, structuré et exploitable (participants si identifiables, décisions, actions / prochaines étapes). Utilise titres Markdown si utile.",
  titles:
    "Propose un titre clair sur la première ligne au format « # … », puis jusqu’à trois sous-titres pertinents sur des lignes « ## … » pour organiser ce contenu.",
};

export function buildSystemPrompt(action: AiAction): string {
  return `${BASE}\n\nTâche : ${USER_INSTRUCTIONS[action]}`;
}

export function buildUserPayload(
  content: string,
  options?: { pageTitle?: string | null },
): string {
  const title = options?.pageTitle?.trim();
  const parts: string[] = [];
  if (title) {
    parts.push(`Titre de la page : ${title}`);
  }
  parts.push("---");
  parts.push(content.trim());
  parts.push("---");
  return parts.join("\n");
}
