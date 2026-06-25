"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";
import {
  HomeIcon,
  SalesIcon,
  OrderIcon,
  StockIcon,
  HistoryIcon,
  ChartIcon,
} from "@/components/icons";

const links: {
  href: string;
  label: string;
  Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
}[] = [
  { href: "/", label: "Painel", Icon: HomeIcon },
  { href: "/vendas", label: "Vendas", Icon: SalesIcon },
  { href: "/encomendas", label: "Encomendas", Icon: OrderIcon },
  { href: "/historico", label: "Histórico", Icon: HistoryIcon },
  { href: "/estoque", label: "Estoque", Icon: StockIcon },
  { href: "/relatorios", label: "Relatórios", Icon: ChartIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// Menu lateral (desktop): lista vertical com rotulos.
export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {links.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-colors ${
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

// Barra de navegacao fixa embaixo (mobile): icones grandes + rotulo pequeno.
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t-2 border-candy-pink bg-white md:hidden">
      {links.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 px-0.5 py-2 text-center text-[10px] font-medium leading-tight transition-colors ${
              active
                ? "bg-candy-pink-light text-candy-brown"
                : "text-candy-brown-light"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
