"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Painel", icon: "🏠" },
  { href: "/vendas", label: "Vendas", icon: "🧾" },
  { href: "/estoque", label: "Estoque", icon: "📦" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 md:flex-col">
      {links.map((link) => {
        const active =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-1 items-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-colors md:flex-none ${
              active
                ? "bg-candy-pink text-candy-brown"
                : "text-candy-brown hover:bg-candy-pink-light"
            }`}
          >
            <span aria-hidden>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
