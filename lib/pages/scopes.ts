import type { PageScope } from "@/lib/db/types";

export const PAGE_SCOPES = [
  "private",
  "pro",
  "projets",
  "sauvegardes",
  "applications",
] as const satisfies readonly PageScope[];

export type PageScopeMeta = {
  scope: PageScope;
  title: string;
  /** Libellé court, à côté d’un titre de page. */
  shortLabel: string;
  sectionId: string;
  expandedKey: string;
  hiddenKey: string;
  emptyTitle: string;
  exportFolder: string;
};

export const PAGE_SCOPE_META: Record<PageScope, PageScopeMeta> = {
  private: {
    scope: "private",
    title: "Pages privées",
    shortLabel: "Privée",
    sectionId: "sidebar-pages-privees",
    expandedKey: "cnb-sidebar-private-expanded",
    hiddenKey: "cnb-sidebar-private-hidden",
    emptyTitle: "Aucune page",
    exportFolder: "prive",
  },
  pro: {
    scope: "pro",
    title: "Pages PRO",
    shortLabel: "PRO",
    sectionId: "sidebar-pages-pro",
    expandedKey: "cnb-sidebar-pro-expanded",
    hiddenKey: "cnb-sidebar-pro-hidden",
    emptyTitle: "Aucune page PRO",
    exportFolder: "pro",
  },
  projets: {
    scope: "projets",
    title: "Projets",
    shortLabel: "Projets",
    sectionId: "sidebar-pages-projets",
    expandedKey: "cnb-sidebar-projets-expanded",
    hiddenKey: "cnb-sidebar-projets-hidden",
    emptyTitle: "Aucun projet",
    exportFolder: "projets",
  },
  sauvegardes: {
    scope: "sauvegardes",
    title: "Sauvegardes",
    shortLabel: "Sauvegardes",
    sectionId: "sidebar-pages-sauvegardes",
    expandedKey: "cnb-sidebar-sauvegardes-expanded",
    hiddenKey: "cnb-sidebar-sauvegardes-hidden",
    emptyTitle: "Aucune sauvegarde",
    exportFolder: "sauvegardes",
  },
  applications: {
    scope: "applications",
    title: "Applications",
    shortLabel: "Applications",
    sectionId: "sidebar-pages-applications",
    expandedKey: "cnb-sidebar-applications-expanded",
    hiddenKey: "cnb-sidebar-applications-hidden",
    emptyTitle: "Aucune application",
    exportFolder: "applications",
  },
};

export function parsePageScope(value: string | null | undefined): PageScope {
  if (value && (PAGE_SCOPES as readonly string[]).includes(value)) {
    return value as PageScope;
  }
  return "private";
}
