import { createClient } from "@supabase/supabase-js";
import { requireSupabasePublicConfig } from "./public-env";

/**
 * Client serveur avec la clé service_role : accès DB comme l’ancien Firebase Admin.
 * Ne jamais importer ce module dans du code client.
 */
export function createServiceRoleClient() {
  const { url } = requireSupabasePublicConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY est requis pour les Server Actions (clé service_role, jamais côté client).",
    );
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
