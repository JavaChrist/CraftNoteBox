import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "default" | "destructive" | "muted";
  action?: { href: string; label: string };
};

/**
 * Panneau centré pour erreurs 404 / 403 ou états vides plein écran.
 */
export function SimpleMessageScreen({
  icon: Icon,
  title,
  description,
  tone = "default",
  action,
}: Props) {
  const iconClass =
    tone === "destructive"
      ? "text-destructive"
      : tone === "muted"
        ? "text-muted-foreground"
        : "text-muted-foreground";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-foreground">
      <div className="w-full max-w-md rounded-xl border border-border bg-card/80 p-8 text-center shadow-sm">
        <Icon className={`mx-auto h-10 w-10 ${iconClass}`} aria-hidden />
        <h1 className="mt-4 text-lg font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {action ? (
          <Link
            href={action.href}
            className="mt-6 inline-flex rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition hover:opacity-90"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
