import Image from "next/image";
import { BRAND_ICON_192 } from "@/lib/brand-assets";

type Props = {
  /** `md` ≈ 40px, `lg` ≈ 56px (sidebar), `xl` ≈ 112px (login) */
  size?: "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
};

const dim = {
  md: { px: 40, className: "h-10 w-10" },
  lg: { px: 56, className: "h-14 w-14" },
  xl: { px: 112, className: "h-28 w-28" },
} as const;

export default function BrandMark({
  size = "md",
  className = "",
  priority = false,
}: Props) {
  const d = dim[size];
  return (
    <Image
      src={BRAND_ICON_192}
      alt="CraftNoteBox"
      width={d.px}
      height={d.px}
      className={`shrink-0 rounded-xl object-contain ${d.className} ${className}`}
      priority={priority}
    />
  );
}
