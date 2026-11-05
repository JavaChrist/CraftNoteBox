const SLUG_MAX = 40;
const TITLE_MAX = 40;

export function normalizeSectionTitle(raw: string): string {
  const title = raw.trim().replace(/\s+/g, " ");
  if (!title) {
    throw new Error("Indique un nom pour la rubrique.");
  }
  if (title.length > TITLE_MAX) {
    throw new Error("Le nom est limité à 40 caractères.");
  }
  return title;
}

export function sectionShortLabelFromTitle(title: string): string {
  if (title.length <= 18) return title;
  return `${title.slice(0, 17).trimEnd()}…`;
}

export function slugifySectionTitle(title: string): string {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
  return base || "rubrique";
}

export function uniqueSectionSlug(title: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const base = slugifySectionTitle(title);
  if (!used.has(base)) return base;

  for (let index = 2; index < 1000; index += 1) {
    const suffix = `-${index}`;
    const cut = base.slice(0, SLUG_MAX - suffix.length).replace(/-+$/g, "");
    const candidate = `${cut || "rubrique"}${suffix}`;
    if (!used.has(candidate)) return candidate;
  }

  throw new Error("Impossible de créer un identifiant pour cette rubrique.");
}

export function sameSectionTitle(a: string, b: string): boolean {
  return a.localeCompare(b, "fr", { sensitivity: "accent" }) === 0;
}
