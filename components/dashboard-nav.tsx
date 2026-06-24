"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";
import { HomeIcon, SalesIcon, StockIcon } from "@/components/icons";

const links: {
  href: string;
  label: string;
  Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
}[] = [
  { href: "/", label: "Painel", Icon: HomeIcon },
  { href: "/vendas", label: "Vendas", Icon: SalesIcon },
  { href: "/estoque", label: "Estoque", Icon: StockIcon },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 md:flex-col">
      {links.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 items-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-colors md:flex-none ${
              active
                ? "bg-candy-pink text-candy-brown"
                : "text-candy-brown hover:bg-candy-pink-light"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
