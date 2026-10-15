import Link from "next/link";
import {
  AppWindow,
  Archive,
  Briefcase,
  CalendarDays,
  FileText,
  FolderKanban,
  Search,
  Sparkles,
} from "lucide-react";

const cards = [
  {
    href: "/pages#sidebar-pages-privees",
    title: "Pages privées",
    description:
      "Notes personnelles : crée des pages et sous-pages, éditeur riche dans la barre latérale.",
    icon: FileText,
  },
  {
    href: "/pages#sidebar-pages-pro",
    title: "Pages PRO",
    description:
      "Espace dédié aux contenus PRO : même outils que les pages privées, liste séparée.",
    icon: Briefcase,
  },
  {
    href: "/pages#sidebar-pages-projets",
    title: "Projets",
    description: "Notes de projet, séparées des pages privées et PRO.",
    icon: FolderKanban,
  },
  {
    href: "/pages#sidebar-pages-sauvegardes",
    title: "Sauvegardes",
    description: "Procédures, copies et points de restauration à garder sous la main.",
    icon: Archive,
  },
  {
    href: "/pages#sidebar-pages-applications",
    title: "Applications",
    description: "Fiches et notes pour chaque application.",
    icon: AppWindow,
  },
  {
    href: "/meetings",
    title: "Réunions",
    description: "Planifie tes rendez-vous et retrouve-les dans le calendrier.",
    icon: CalendarDays,
  },
  {
    href: "/assistant",
    title: "JavaChrist",
    description:
      "Résume, structure et reformule depuis une page. Cette page rappelle comment l’utiliser.",
    icon: Sparkles,
  },
  {
    href: "/search",
    title: "Recherche",
    description: "Trouve rapidement une page dans tes contenus.",
    icon: Search,
  },
] as const;

export default function HomeCards() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {cards.map(({ href, title, description, icon: Icon }) => (
        <li key={href}>
          <Link
            href={href}
            className="group flex h-full flex-col rounded-xl border border-border bg-card/40 p-5 transition hover:border-border hover:bg-card/70"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="font-semibold tracking-tight text-foreground group-hover:underline group-hover:underline-offset-4">
                  {title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
            <span className="mt-4 text-xs font-medium text-muted-foreground group-hover:text-foreground">
              Ouvrir →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
