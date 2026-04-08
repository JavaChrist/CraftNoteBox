"use client";

type Props = {
  label: string;
  description: string;
  onClick: () => void;
};

export default function JavaChristActionItem({
  label,
  description,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm transition hover:bg-secondary"
    >
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  );
}
