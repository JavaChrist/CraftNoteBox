import Link from "next/link";
import { globalSearch } from "@/lib/actions/search";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  let results: Awaited<ReturnType<typeof globalSearch>> = [];
  let searchError: string | null = null;

  if (query.length > 0) {
    try {
      results = await globalSearch(query);
    } catch (err) {
      searchError =
        err instanceof Error ? err.message : "La recherche a échoué.";
    }
  }

  return (
    <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-2xl space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Recherche
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Trouver une page</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Recherche dans les titres et dans le texte des blocs.
            </p>
          </div>

          <form action="/search" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="search-q" className="sr-only">
              Terme de recherche
            </label>
            <input
              id="search-q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Mot-clé…"
              autoComplete="off"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Rechercher
            </button>
          </form>

          {searchError ? (
            <div
              className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              <p className="font-medium">Erreur</p>
              <p className="mt-1 text-xs opacity-90">{searchError}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Si le message indique une fonction manquante, exécute le script{" "}
                <code className="rounded bg-muted px-1 text-foreground">
                  supabase/migrations/20260410000000_global_search.sql
                </code>{" "}
                dans l’éditeur SQL Supabase.
              </p>
            </div>
          ) : null}

          {!searchError && query.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Saisis un terme ci-dessus pour lancer une recherche.
            </p>
          ) : null}

          {!searchError && query.length > 0 && results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun résultat pour « {query} ».
            </p>
          ) : null}

          {!searchError && results.length > 0 ? (
            <ul className="space-y-2" aria-label="Résultats">
              {results.map((r) => (
                <li key={r.pageId}>
                  <Link
                    href={`/pages/${r.pageId}`}
                    className="block rounded-lg border border-border bg-card/40 px-4 py-3 transition hover:bg-secondary/60"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium leading-snug">
                        {r.pageTitle || "Sans titre"}
                      </span>
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {r.kind === "title" ? "Titre" : "Contenu"}
                      </span>
                    </div>
                    {r.kind === "content" ? (
                      r.snippet ? (
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                          {r.snippet}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Correspondance dans le contenu de la page.
                        </p>
                      )
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Correspondance dans le titre.
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
    </main>
  );
}
