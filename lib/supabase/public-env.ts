/**
 * URL + clé **anon** (publique), pas la clé service_role.
 * Noms acceptés : NEXT_PUBLIC_* ou alias SUPABASE_URL / SUPABASE_ANON_KEY (voir next.config.mjs).
 */
export function getSupabasePublicConfig():
  | { url: string; anonKey: string }
  | null {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  )?.trim();
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
  )?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function requireSupabasePublicConfig(): { url: string; anonKey: string } {
  const cfg = getSupabasePublicConfig();
  if (!cfg) {
    throw new Error(
      "Il manque l’URL Supabase et la clé **anon** (publique), pas seulement la clé secrète service_role. " +
        "Dans .env.local, ajoute par exemple : NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "(ou SUPABASE_URL + SUPABASE_ANON_KEY). " +
        "Sur Supabase → Project Settings → API : « anon public » = anon key, « service_role » = SUPABASE_SERVICE_ROLE_KEY — ce sont deux clés différentes.",
    );
  }
  return cfg;
}
