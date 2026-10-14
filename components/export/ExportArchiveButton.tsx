"use client";

import { Download } from "lucide-react";
import { useState } from "react";

export default function ExportArchiveButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/export", { cache: "no-store" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Export impossible");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const match = /filename="([^"]+)"/.exec(
        response.headers.get("Content-Disposition") ?? "",
      );
      link.href = url;
      link.download = match?.[1] || "craftnotebox.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export impossible");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => void download()}
        disabled={pending}
        className="flex min-h-11 w-full touch-manipulation items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-60"
      >
        <Download className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
        <span className="truncate">{pending ? "Export…" : "Exporter les pages"}</span>
      </button>
      {error ? (
        <p className="px-2 pb-1 text-xs leading-5 text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
