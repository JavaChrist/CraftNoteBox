import Link from "next/link";
import { AlertCircle } from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";
import { createPage, listPages } from "@/lib/actions/pages";
import SidebarNav from "@/components/layout/SidebarNav";
import SidebarPrivatePages from "@/components/layout/SidebarPrivatePages";
import SidebarProPages from "@/components/layout/SidebarProPages";
import type { Page } from "@/lib/db/types";

function formatLoadError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export default async function Sidebar() {
  let privatePages: Page[] = [];
  let proPages: Page[] = [];
  let loadError: string | null = null;

  try {
    [privatePages, proPages] = await Promise.all([
      listPages("private"),
      listPages("pro"),
    ]);
  } catch (err) {
    loadError = formatLoadError(err);
    console.error("Impossible de charger les pages:", loadError);
  }

  async function handleCreatePrivatePage() {
    "use server";
    await createPage({ title: "Nouvelle page", scope: "private" });
  }

  async function handleCreateProPage() {
    "use server";
    await createPage({ title: "Nouvelle page", scope: "pro" });
  }

  return (
    <aside className="flex h-full min-h-0 w-72 flex-col border-r border-border bg-card/50">
      <div className="flex items-center px-4 py-3">
        <Link
          href="/home"
          className="flex min-w-0 items-center gap-2.5 text-muted-foreground transition hover:text-foreground"
        >
          <BrandMark size="md" className="opacity-95" />
          <span className="text-xs font-semibold uppercase tracking-[0.08em]">
            CraftNoteBox
          </span>
        </Link>
      </div>
      <SidebarNav />
      <div className="flex-1 overflow-y-auto">
        {loadError ? (
          <div className="mx-3 mt-2 space-y-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            <div className="flex gap-2">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                aria-hidden
              />
              <div className="min-w-0 space-y-1.5">
                <p className="text-sm font-medium text-destructive">
                  Impossible de charger les pages
                </p>
                <p className="break-words text-xs text-destructive/90">
                  {loadError}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Vérifie que les migrations SQL ont été exécutées (dont{" "}
                  <code className="rounded bg-muted px-1">
                    20260411000000_page_scope.sql
                  </code>
                  ) et que{" "}
                  <code className="rounded bg-muted px-1">
                    SUPABASE_SERVICE_ROLE_KEY
                  </code>{" "}
                  est bien la clé secrète du projet.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <SidebarPrivatePages
              pages={privatePages}
              createPageAction={handleCreatePrivatePage}
            />
            <SidebarProPages
              pages={proPages}
              createPageAction={handleCreateProPage}
            />
          </>
        )}
      </div>
      <div className="border-t border-border px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="min-h-11 w-full touch-manipulation rounded-md px-2 py-2 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
