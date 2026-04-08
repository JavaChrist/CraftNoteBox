import { Inbox, Mail } from "lucide-react";

export default function InboxPlaceholder() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-xl border border-border bg-card/40 p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Boîte de réception
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Le module e-mail et les notifications arriveront en{" "}
          <strong className="font-medium text-foreground">phase 2</strong>. Cette
          section est déjà dans la navigation pour préparer la suite.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Rien à afficher pour le moment.</span>
        </div>
      </div>
    </div>
  );
}
