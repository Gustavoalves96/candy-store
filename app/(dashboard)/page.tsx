import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatBRL, formatQty, startOfMonthSP, startOfTodaySP } from "@/lib/format";
import {
  SalesIcon,
  StockIcon,
  HistoryIcon,
  ChartIcon,
  MoneyIcon,
  CalendarIcon,
  AlertIcon,
} from "@/components/icons";

export default async function DashboardHome() {
  const session = await auth();
  const nome = session?.user?.name?.split(" ")[0] ?? "";

  const [vendasHoje, vendasMes, vendasTotal, comprasTotal, ingredients] =
    await Promise.all([
      db.sale.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfTodaySP() } },
      }),
      db.sale.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfMonthSP() } },
      }),
      db.sale.aggregate({ _sum: { total: true } }),
      db.purchase.aggregate({ _sum: { amount: true } }),
      db.ingredient.findMany({ orderBy: { name: "asc" } }),
    ]);

  const totalHoje = Number(vendasHoje._sum.total ?? 0);
  const totalMes = Number(vendasMes._sum.total ?? 0);
  const saldo =
    Number(vendasTotal._sum.total ?? 0) - Number(comprasTotal._sum.amount ?? 0);

  const faltando = ingredients.filter(
    (i) => i.quantityCurrent < i.quantityMin,
  );

  const atalhos = [
    { href: "/vendas", label: "Registrar venda", Icon: SalesIcon },
    { href: "/estoque", label: "Estoque", Icon: StockIcon },
    { href: "/historico", label: "Histórico", Icon: HistoryIcon },
    { href: "/relatorios", label: "Relatórios", Icon: ChartIcon },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-candy-brown">
        Olá{nome ? `, ${nome}` : ""}!
      </h1>
      <p className="mt-1 text-candy-brown-light">
        Aqui está o resumo da sua loja.
      </p>

      {/* Resumo financeiro */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-candy-pink bg-white p-5">
          <MoneyIcon className="h-7 w-7 text-candy-brown-light" />
          <p className="mt-2 text-sm text-candy-brown-light">Vendas de hoje</p>
          <p className="text-2xl font-bold text-candy-brown">
            {formatBRL(totalHoje)}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-candy-pink bg-white p-5">
          <CalendarIcon className="h-7 w-7 text-candy-brown-light" />
          <p className="mt-2 text-sm text-candy-brown-light">Vendas do mês</p>
          <p className="text-2xl font-bold text-candy-brown">
            {formatBRL(totalMes)}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-candy-pink bg-white p-5">
          <ChartIcon className="h-7 w-7 text-candy-brown-light" />
          <p className="mt-2 text-sm text-candy-brown-light">
            Saldo (vendas − ingredientes)
          </p>
          <p
            className={`text-2xl font-bold ${
              saldo >= 0 ? "text-green-700" : "text-red-600"
            }`}
          >
            {formatBRL(saldo)}
          </p>
        </div>
      </div>

      {/* Alertas de estoque baixo */}
      <h2 className="mb-3 mt-8 text-xl font-semibold text-candy-brown">
        Estoque
      </h2>
      {faltando.length > 0 ? (
        <Link
          href="/estoque"
          className="block rounded-2xl border-2 border-red-300 bg-red-50 p-4 transition-colors hover:bg-red-100"
        >
          <div className="flex items-start gap-3 text-red-700">
            <AlertIcon className="mt-0.5 h-6 w-6 shrink-0" />
            <div>
              <p className="font-semibold">
                {faltando.length}{" "}
                {faltando.length === 1
                  ? "ingrediente está faltando"
                  : "ingredientes estão faltando"}
              </p>
              <ul className="mt-1 text-sm">
                {faltando.map((i) => (
                  <li key={i.id}>
                    {i.name} — {formatQty(i.quantityCurrent)} {i.unit} (mín{" "}
                    {formatQty(i.quantityMin)} {i.unit})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Link>
      ) : (
        <div className="rounded-2xl border-2 border-candy-pink bg-white p-4 text-candy-brown-light">
          Estoque em dia — nenhum ingrediente abaixo do mínimo.
        </div>
      )}

      {/* Atalhos rapidos */}
      <h2 className="mb-3 mt-8 text-xl font-semibold text-candy-brown">
        Atalhos
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {atalhos.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-candy-pink bg-white p-5 text-center font-medium text-candy-brown transition-colors hover:bg-candy-pink-light"
          >
            <Icon className="h-8 w-8" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
