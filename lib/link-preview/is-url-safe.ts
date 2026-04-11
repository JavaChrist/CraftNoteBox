/**
 * Réduit le risque SSRF : refuse schémas non http(s) et hôtes / plages privés.
 */
export function isUrlSafeForServerFetch(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return false;
  if (host === "0.0.0.0") return false;
  if (host === "[::1]" || host === "::1") return false;
  if (host.startsWith("127.")) return false;
  if (host.startsWith("10.")) return false;
  if (host.startsWith("192.168.")) return false;
  if (host.startsWith("169.254.")) return false;
  const m172 = /^172\.(\d+)\./.exec(host);
  if (m172) {
    const n = Number(m172[1]);
    if (n >= 16 && n <= 31) return false;
  }
  return true;
}

export function resolveUrlMaybeRelative(
  raw: string,
  baseHref: string,
): string | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  try {
    return new URL(t, baseHref).href;
  } catch {
    return undefined;
  }
}
