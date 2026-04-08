import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

export default function PagesHome() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-8 py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Tes pages
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ouvre une page depuis{" "}
              <span className="font-medium text-foreground">Pages privées</span>{" "}
              ou{" "}
              <span className="font-medium text-foreground">Pages PRO</span> dans
              la barre latérale, ou crée-en une avec le bouton{" "}
              <span className="font-medium text-foreground">+</span> de la section
              voulue.
            </p>
          </div>
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-6">
            <div className="flex items-start gap-3">
              <FileText
                className="mt-0.5 h-8 w-8 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div className="min-w-0 space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Aucune page sélectionnée
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Plus
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span>
                      Clique sur le bouton{" "}
                      <span className="font-medium text-foreground">+</span> à
                      côté de « Pages privées » ou « Pages PRO » pour créer une
                      page.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <FileText
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span>
                      Ou choisis une page existante dans la liste à gauche.
                    </span>
                  </li>
                </ul>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                >
                  <Search className="h-3.5 w-3.5" aria-hidden />
                  Rechercher une page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

