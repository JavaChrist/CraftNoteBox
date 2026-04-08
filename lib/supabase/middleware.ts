import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "./public-env";

let warnedMissingSupabaseEnv = false;

export async function updateSession(request: NextRequest) {
  const publicCfg = getSupabasePublicConfig();
  if (!publicCfg) {
    if (process.env.NODE_ENV === "development" && !warnedMissingSupabaseEnv) {
      warnedMissingSupabaseEnv = true;
      console.warn(
        "[CraftNoteBox] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manquant dans .env.local — le proxy ne rafraîchit pas la session. Voir README (section variables d’environnement).",
      );
    }
    return NextResponse.next({ request });
  }

  const { url, anonKey } = publicCfg;

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}
