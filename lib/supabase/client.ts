import { createBrowserClient } from "@supabase/ssr";
import { requireSupabasePublicConfig } from "./public-env";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = requireSupabasePublicConfig();
  return createBrowserClient(url, anonKey);
}
