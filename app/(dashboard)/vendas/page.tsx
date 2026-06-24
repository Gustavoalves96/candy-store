import Link from "next/link";
import { db } from "@/lib/db";
import { SaleForm } from "@/components/sale-form";
import { CalendarIcon, MoneyIcon } from "@/components/icons";
import {
  formatBRL,
  formatDateTimeBR,
  startOfMonthSP,
  startOfTodaySP,
} from "@/lib/format";

export default async function VendasPage() {
  const [activeProducts, sales, somaHoje, somaMes] = await Promise.all([
    db.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    db.sale.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { items: true },
    }),
    db.sale.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: startOfTodaySP() } },
    }),
    db.sale.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: startOfMonthSP() } },
    }),
  ]);

  const productOptions = activeProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
  }));

  const totalHoje = Number(somaHoje._sum.total ?? 0);
  const totalMes = Number(somaMes._sum.total ?? 0);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-candy-brown">Vendas</h1>
        <Link
          href="/produtos"
          className="rounded-xl border border-candy-pink px-4 py-2 text-sm font-medium text-candy-brown hover:bg-candy-pink-light"
        >
          Gerenciar produtos
        </Link>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-candy-pink bg-white p-5">
          <MoneyIcon className="h-8 w-8 text-candy-brown-light" />
          <div>
            <p className="text-sm text-candy-brown-light">Total de hoje</p>
            <p className="text-2xl font-bold text-candy-brown">
              {formatBRL(totalHoje)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-candy-pink bg-white p-5">
          <CalendarIcon className="h-8 w-8 text-candy-brown-light" />
          <div>
            <p className="text-sm text-candy-brown-light">Total do mês</p>
            <p className="text-2xl font-bold text-candy-brown">
              {formatBRL(totalMes)}
            </p>
          </div>
        </div>
      </div>

      {/* Registrar venda */}
      <h2 className="mb-3 mt-8 text-xl font-semibold text-candy-brown">
        Registrar venda
      </h2>
      <SaleForm products={productOptions} />

      {/* Historico */}
      <h2 className="mb-3 mt-8 text-xl font-semibold text-candy-brown">
        Histórico
      </h2>
      <div className="overflow-hidden rounded-2xl border-2 border-candy-pink bg-white">
        {sales.length === 0 ? (
          <p className="p-6 text-center text-candy-brown-light">
            Nenhuma venda registrada ainda.
          </p>
        ) : (
          <ul className="divide-y divide-candy-pink-light">
            {sales.map((sale) => {
              const qtdItens = sale.items.reduce(
                (acc, i) => acc + i.quantity,
                0,
              );
              return (
                <li
                  key={sale.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div>
                    <p className="font-medium text-candy-brown">
                      {sale.customerName}
                    </p>
                    <p className="text-sm text-candy-brown-light">
                      {formatDateTimeBR(sale.createdAt)} · {qtdItens}{" "}
                      {qtdItens === 1 ? "item" : "itens"}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-candy-brown">
                    {formatBRL(sale.total)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
