import { Sparkles } from "lucide-react";

export default function AssistantHero() {
  return (
    <header className="border-b border-border pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Assistant intégré
          </p>
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary ring-1 ring-border"
              aria-hidden
            >
              <Sparkles className="h-5 w-5 text-amber-400" />
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              JavaChrist
            </h1>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            Votre assistant pour structurer, résumer et améliorer vos contenus —
            directement dans vos pages, sans quitter le fil de rédaction.
          </p>
        </div>
      </div>
    </header>
  );
}
