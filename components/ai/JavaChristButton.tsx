"use client";

import { forwardRef } from "react";
import { Sparkles } from "lucide-react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pending?: boolean;
};

const JavaChristButton = forwardRef<HTMLButtonElement, Props>(
  function JavaChristButton(
    { pending, className = "", children, disabled, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || pending}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-secondary disabled:opacity-50 ${className}`}
        {...rest}
      >
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
        {children ?? "IA JavaChrist"}
      </button>
    );
  },
);

export default JavaChristButton;
