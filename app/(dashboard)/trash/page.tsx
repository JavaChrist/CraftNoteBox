import Link from "next/link";
import TrashPageClient from "@/components/pages/TrashPageClient";
import { listTrashedPages } from "@/lib/actions/pages";
import type { Page } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export default async function TrashRoute() {
  let pages: Page[] = [];
  try {
    pages = await listTrashedPages();
  } catch {
    pages = [];
  }

  return (
    <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
            Pages
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Corbeille
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Les pages supprimées depuis la barre latérale restent ici jusqu’à
            restauration ou suppression définitive.
          </p>
        </div>
        <p className="text-sm">
          <Link
            href="/pages"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            ← Retour aux pages
          </Link>
        </p>
        <TrashPageClient initialPages={pages} />
      </div>
    </main>
  );
}
