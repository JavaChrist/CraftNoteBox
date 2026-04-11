const STORAGE_KEY = "cnb-search-history";
const MAX_ITEMS = 10;

function readRaw(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function getSearchHistory(): string[] {
  return readRaw();
}

export function pushSearchHistory(query: string): void {
  if (typeof window === "undefined") return;
  const q = query.trim();
  if (!q) return;
  const prev = readRaw().filter((x) => x.toLowerCase() !== q.toLowerCase());
  const next = [q, ...prev].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
