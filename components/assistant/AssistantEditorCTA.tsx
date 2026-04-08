import Link from "next/link";
import { FileEdit } from "lucide-react";

export default function AssistantEditorCTA() {
  return (
    <aside
      className="rounded-xl border border-border bg-gradient-to-br from-secondary/40 to-card/40 p-6 ring-1 ring-border/60 sm:p-8"
      aria-labelledby="assistant-cta-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background/80 ring-1 ring-border">
            <FileEdit className="h-6 w-6 text-muted-foreground" aria-hidden />
          </span>
          <div>
            <h2
              id="assistant-cta-title"
              className="text-base font-semibold text-foreground"
            >
              Utilisez JavaChrist directement depuis vos pages
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Ouvrez une page, placez le curseur ou sélectionnez du texte, puis
              utilisez le bouton{" "}
              <span className="font-medium text-foreground">✨ JavaChrist</span>{" "}
              ou une commande slash. Vous validez chaque résultat avant
              insertion dans le document.
            </p>
          </div>
        </div>
        <Link
          href="/pages"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:self-center"
        >
          Ouvrir mes pages
        </Link>
      </div>
    </aside>
  );
}
