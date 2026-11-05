"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordField from "@/components/auth/PasswordField";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  authError?: boolean;
};

export default function LoginForm({ authError = false }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    authError ? "Le lien a expiré. Demande-en un nouveau." : null,
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signError) {
      setError("E-mail ou mot de passe incorrect.");
      return;
    }
    router.refresh();
    router.push("/home");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <PasswordField
        id="password"
        label="Mot de passe"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />
      <div className="flex justify-end">
        <Link
          href="/mot-de-passe-oublie"
          className="text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
        >
          Mot de passe oublié
        </Link>
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
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
