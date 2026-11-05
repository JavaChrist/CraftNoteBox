"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
};

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: Props) {
  const [shown, setShown] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          name={id}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-md border border-border bg-background py-2 pl-3 pr-10 text-sm"
        />
        <button
          type="button"
          onClick={() => setShown((current) => !current)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition hover:text-foreground"
          aria-label={shown ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {shown ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
