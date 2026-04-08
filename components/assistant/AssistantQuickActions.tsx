import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  FileText,
  Heading,
  ListChecks,
  ListTree,
  PenLine,
  ScrollText,
} from "lucide-react";

export type QuickActionItem = {
  title: string;
  description: string;
  slash: string;
  Icon: LucideIcon;
};

const ACTIONS: QuickActionItem[] = [
  {
    title: "Résumer un contenu",
    description:
      "Obtenir une synthèse claire à partir d’une sélection ou de la page entière.",
    slash: "/résumé",
    Icon: FileText,
  },
  {
    title: "Reformuler un texte",
    description:
      "Adapter le ton : plus fluide, professionnel, sans déformer le sens.",
    slash: "/reformuler",
    Icon: PenLine,
  },
  {
    title: "Générer un plan",
    description:
      "Structurer des idées en titres et sous-parties prêtes à éditer.",
    slash: "/plan",
    Icon: ListTree,
  },
  {
    title: "Transformer en checklist",
    description:
      "Convertir du texte en tâches concrètes avec cases à cocher.",
    slash: "/checklist",
    Icon: ListChecks,
  },
  {
    title: "Générer un compte rendu",
    description:
      "À partir de notes brutes : compte rendu de réunion lisible et actionnable.",
    slash: "/compte-rendu",
    Icon: ScrollText,
  },
  {
    title: "Proposer des titres",
    description:
      "Un titre principal et des sous-titres pour cadrer votre contenu.",
    slash: "/titres",
    Icon: Heading,
  },
];

export default function AssistantQuickActions() {
  return (
    <section className="space-y-4" aria-labelledby="assistant-quick-title">
      <div>
        <h2
          id="assistant-quick-title"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Actions rapides
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ces fonctions sont disponibles dans l’éditeur via le bouton{" "}
          <span className="font-medium text-foreground">✨ JavaChrist</span> ou
          le menu slash (tapez la commande indiquée dans une page).
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIONS.map((item) => {
          const Icon = item.Icon;
          return (
            <li key={item.title}>
              <Link
                href="/pages"
                className="group flex h-full flex-col rounded-xl border border-border bg-card/30 p-5 transition hover:border-border hover:bg-card/60"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground ring-1 ring-border/80">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <h3 className="mt-3 font-semibold text-foreground group-hover:underline group-hover:underline-offset-4">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-4">
                  <code className="rounded bg-muted/80 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {item.slash}
                  </code>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                    Ouvrir une page
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
