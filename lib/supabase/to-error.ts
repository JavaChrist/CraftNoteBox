type PgLike = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

/**
 * Les erreurs PostgREST ne se sérialisent pas bien dans les Server Components / logs Next.
 */
export function supabaseToError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (err && typeof err === "object" && "message" in err) {
    const p = err as PgLike;
    const parts = [p.message, p.details, p.hint].filter(
      (x): x is string => typeof x === "string" && x.length > 0,
    );
    const msg = parts.length > 0 ? parts.join(" — ") : "Erreur Supabase";
    return p.code ? new Error(`${msg} [${p.code}]`) : new Error(msg);
  }
  return new Error(String(err));
}
