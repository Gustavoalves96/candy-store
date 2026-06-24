import Link from "next/link";
import { auth } from "@/auth";
import { SalesIcon, StockIcon } from "@/components/icons";

export default async function DashboardHome() {
  const session = await auth();
  const nome = session?.user?.name?.split(" ")[0] ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-candy-brown">
        Olá{nome ? `, ${nome}` : ""}!
      </h1>
      <p className="mt-2 text-candy-brown-light">
        Bem-vinda ao painel da Candy Store.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/vendas"
          className="rounded-2xl border-2 border-candy-pink bg-white p-6 transition-colors hover:bg-candy-pink-light"
        >
          <SalesIcon className="h-8 w-8 text-candy-brown" />
          <h2 className="mt-2 text-xl font-semibold text-candy-brown">Vendas</h2>
          <p className="mt-1 text-sm text-candy-brown-light">
            Registrar vendas e ver o histórico.
          </p>
        </Link>

        <Link
          href="/estoque"
          className="rounded-2xl border-2 border-candy-pink bg-white p-6 transition-colors hover:bg-candy-pink-light"
        >
          <StockIcon className="h-8 w-8 text-candy-brown" />
          <h2 className="mt-2 text-xl font-semibold text-candy-brown">
            Estoque
          </h2>
          <p className="mt-1 text-sm text-candy-brown-light">
            Controlar ingredientes e alertas de falta.
          </p>
        </Link>
      </div>
    </div>
  );
}
