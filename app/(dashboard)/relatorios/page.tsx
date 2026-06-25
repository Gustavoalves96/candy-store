import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { MoneyIcon, StockIcon, SalesIcon } from "@/components/icons";

export default async function RelatoriosPage() {
  const [recebidoAgg, abertoAgg, comprasAgg] = await Promise.all([
    db.sale.aggregate({ _sum: { total: true }, where: { paid: true } }),
    db.sale.aggregate({ _sum: { total: true }, where: { paid: false } }),
    db.purchase.aggregate({ _sum: { amount: true } }),
  ]);

  const recebidoVendas = Number(recebidoAgg._sum.total ?? 0);
  const emAberto = Number(abertoAgg._sum.total ?? 0);
  const gastoIngredientes = Number(comprasAgg._sum.amount ?? 0);
  const saldo = recebidoVendas - gastoIngredientes;

  const maxVal = Math.max(recebidoVendas, emAberto, gastoIngredientes, 1);
  const barras = [
    {
      label: "Recebido",
      valor: recebidoVendas,
      cor: "bg-candy-brown",
    },
    {
      label: "Em aberto",
      valor: emAberto,
      cor: "bg-amber-500",
    },
    {
      label: "Ingredientes",
      valor: gastoIngredientes,
      cor: "bg-candy-pink",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-3xl font-bold text-candy-brown">Relatórios</h1>
      <p className="mb-6 text-sm text-candy-brown-light">
        Vendas já recebidas, vendas em aberto (não pagas) e o total gasto
        comprando ingredientes.
      </p>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-candy-pink bg-white p-5">
          <MoneyIcon className="h-7 w-7 text-candy-brown-light" />
          <p className="mt-2 text-sm text-candy-brown-light">
            Recebido em vendas
          </p>
          <p className="text-2xl font-bold text-candy-brown">
            {formatBRL(recebidoVendas)}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
          <SalesIcon className="h-7 w-7 text-amber-600" />
          <p className="mt-2 text-sm text-amber-700">Em aberto (não pago)</p>
          <p className="text-2xl font-bold text-amber-700">
            {formatBRL(emAberto)}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-candy-pink bg-white p-5">
          <StockIcon className="h-7 w-7 text-candy-brown-light" />
          <p className="mt-2 text-sm text-candy-brown-light">
            Gasto em ingredientes
          </p>
          <p className="text-2xl font-bold text-candy-brown">
            {formatBRL(gastoIngredientes)}
          </p>
        </div>
      </div>

      {/* Grafico de barras */}
      <div className="mt-6 rounded-2xl border-2 border-candy-pink bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-candy-brown">
          Comparativo
        </h2>

        <div className="flex flex-col gap-5">
          {barras.map((b) => (
            <div key={b.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-candy-brown">{b.label}</span>
                <span className="text-candy-brown-light">
                  {formatBRL(b.valor)}
                </span>
              </div>
              <div className="h-6 w-full overflow-hidden rounded-full bg-candy-pink-light">
                <div
                  className={`h-full rounded-full ${b.cor}`}
                  style={{ width: `${(b.valor / maxVal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Saldo */}
        <div className="mt-6 flex items-center justify-between border-t border-candy-pink-light pt-4">
          <span className="font-medium text-candy-brown">
            Saldo (recebido − ingredientes)
          </span>
          <span
            className={`text-xl font-bold ${
              saldo >= 0 ? "text-green-700" : "text-red-600"
            }`}
          >
            {formatBRL(saldo)}
          </span>
        </div>
      </div>

      <p className="mt-4 text-xs text-candy-brown-light">
        Observação: &quot;Recebido&quot; conta só as vendas marcadas como pagas.
        Ao marcar uma venda como paga no histórico, o valor sai de &quot;Em
        aberto&quot; e entra em &quot;Recebido&quot;. O gasto em ingredientes vem
        do histórico de compras.
      </p>
    </div>
  );
}
