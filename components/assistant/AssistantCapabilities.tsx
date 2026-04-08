import { Check } from "lucide-react";

const ITEMS = [
  {
    title: "Structurer des notes brutes",
    detail:
      "Passez du flux d’idées à des sections et listes exploitables dans votre base.",
  },
  {
    title: "Résumer une page ou une sélection",
    detail:
      "Ciblez un passage précis ou l’ensemble du contenu pour une synthèse rapide.",
  },
  {
    title: "Transformer des idées en plan",
    detail:
      "Hiérarchie de titres prête à être complétée dans l’éditeur par blocs.",
  },
  {
    title: "Convertir du texte en tâches",
    detail:
      "Checklists alignées sur vos blocs « à faire » existants dans CraftNoteBox.",
  },
  {
    title: "Améliorer la clarté d’un contenu",
    detail:
      "Reformulation et lisibilité, sans dénaturer le fond ni inventer d’informations.",
  },
] as const;

export default function AssistantCapabilities() {
  return (
    <section
      className="space-y-4"
      aria-labelledby="assistant-capabilities-title"
    >
      <h2
        id="assistant-capabilities-title"
        className="text-lg font-semibold tracking-tight text-foreground"
      >
        Ce que JavaChrist peut faire
      </h2>
      <ul className="divide-y divide-border rounded-xl border border-border bg-card/20">
        {ITEMS.map((item) => (
          <li
            key={item.title}
            className="flex gap-3 px-4 py-4 first:rounded-t-xl last:rounded-b-xl sm:gap-4 sm:px-5"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground ring-1 ring-border">
              <Check className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
