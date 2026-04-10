"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Home,
  Inbox,
  Search,
  Sparkles,
} from "lucide-react";

const items = [
  { href: "/home", label: "Accueil", icon: Home },
  { href: "/meetings", label: "Réunions", icon: CalendarDays },
  { href: "/assistant", label: "JavaChrist", icon: Sparkles },
  { href: "/inbox", label: "Boîte de réception", icon: Inbox },
  { href: "/search", label: "Rechercher", icon: Search },
] as const;

function navLinkClass(active: boolean) {
  return [
    "flex min-h-11 touch-manipulation items-center gap-2 rounded-md px-2 py-2 text-sm transition",
    active
      ? "bg-secondary font-medium text-foreground ring-1 ring-border"
      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
  ].join(" ");
}

export default function SidebarNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="border-b border-border px-2 py-2"
      aria-label="Navigation principale"
    >
      <ul className="space-y-0.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={navLinkClass(active)}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
