"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordField from "@/components/auth/PasswordField";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function NewPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState<"loading" | "ready" | "expired">("loading");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => {
      setReady(data.user ? "ready" : "expired");
    });
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("8 caractères minimum.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError("Le mot de passe n’a pas pu être enregistré. Demande un nouveau lien.");
      return;
    }
    router.refresh();
    router.push("/home");
  }

  if (ready === "loading") {
    return <p className="mt-6 text-sm text-muted-foreground">Vérification du lien…</p>;
  }

  if (ready === "expired") {
    return (
      <div className="mt-6 space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Ce lien n’est plus valable. Demande un nouveau message pour choisir
          un mot de passe.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Mot de passe oublié
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Choisis un nouveau mot de passe pour ce compte.
      </p>
      <PasswordField
        id="new-password"
        label="Nouveau mot de passe"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />
      <PasswordField
        id="confirm-password"
        label="Confirmation"
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
      />
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
        {loading ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
