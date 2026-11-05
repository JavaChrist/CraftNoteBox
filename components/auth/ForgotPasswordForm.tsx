"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  linkError?: boolean;
};

export default function ForgotPasswordForm({ linkError = false }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(
    linkError ? "Le lien a expiré. Demande-en un nouveau." : null,
  );
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/nouveau-mot-de-passe`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo },
    );
    setLoading(false);
    if (resetError) {
      setError("L’envoi a échoué. Réessaie dans un instant.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-6 space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Si un compte correspond à cette adresse, un message vient de partir.
          Ouvre-le pour choisir un nouveau mot de passe.
        </p>
        <Link
          href="/login"
          className="inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Indique l’adresse du compte. Un lien pour choisir un nouveau mot de
        passe sera envoyé si elle est connue.
      </p>
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Envoi…" : "Envoyer le lien"}
      </button>
      <Link
        href="/login"
        className="inline-flex text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Retour à la connexion
      </Link>
    </form>
  );
}
