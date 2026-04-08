import { createSupabaseServerClient } from "../supabase/server";

export type SessionUser = {
  uid: string;
  email?: string | null;
};

/**
 * Utilisateur effectif pour les Server Actions (JWT Supabase ou mode dev).
 */
export async function getServerUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { uid: user.id, email: user.email ?? null };
  }

  if (process.env.NODE_ENV !== "production") {
    const devId = process.env.DEV_SUPABASE_USER_ID?.trim();
    if (devId) {
      return { uid: devId, email: "dev@example.com" };
    }
  }

  return null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getServerUser();
  if (!user) {
    throw new Error("Non authentifié");
  }
  return user;
}
