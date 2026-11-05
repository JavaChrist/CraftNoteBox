export const PAGE_SCOPES = [
  "private",
  "pro",
  "projets",
  "sauvegardes",
  "applications",
] as const;

export type BuiltinPageScope = (typeof PAGE_SCOPES)[number];

export type PageScopeMeta = {
  scope: BuiltinPageScope;
  title: string;
  /** Libellé court, à côté d’un titre de page. */
  shortLabel: string;
  sectionId: string;
  expandedKey: string;
  hiddenKey: string;
  emptyTitle: string;
  exportFolder: string;
};

export const PAGE_SCOPE_META: Record<BuiltinPageScope, PageScopeMeta> = {
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

export function isBuiltinPageScope(value: string): value is BuiltinPageScope {
  return (PAGE_SCOPES as readonly string[]).includes(value);
}

/** Slug stocké en base. Une valeur vide retombe sur la rubrique privée. */
export function parsePageScope(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed || "private";
}

export function scopeShortLabel(
  scope: string,
  labels?: Record<string, string>,
): string {
  const fromMap = labels?.[scope];
  if (fromMap) return fromMap;
  if (isBuiltinPageScope(scope)) return PAGE_SCOPE_META[scope].shortLabel;
  return scope;
}

export function sectionDomId(slug: string): string {
  if (isBuiltinPageScope(slug)) return PAGE_SCOPE_META[slug].sectionId;
  return `sidebar-pages-${slug}`;
}

export function sectionExpandedKey(slug: string): string {
  if (isBuiltinPageScope(slug)) return PAGE_SCOPE_META[slug].expandedKey;
  return `cnb-sidebar-${slug}-expanded`;
}

export function sectionHiddenKey(slug: string): string {
  if (isBuiltinPageScope(slug)) return PAGE_SCOPE_META[slug].hiddenKey;
  return `cnb-sidebar-${slug}-hidden`;
}

export function sectionEmptyTitle(slug: string): string {
  if (isBuiltinPageScope(slug)) return PAGE_SCOPE_META[slug].emptyTitle;
  return "Aucune page";
}

export function scopeExportFolder(scope: string): string {
  if (isBuiltinPageScope(scope)) return PAGE_SCOPE_META[scope].exportFolder;
  const folder = scope.replace(/[^a-z0-9-]/g, "");
  return folder || "rubrique";
}
