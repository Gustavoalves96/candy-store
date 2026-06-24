import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { MoneyIcon, StockIcon } from "@/components/icons";

export default async function RelatoriosPage() {
  const [vendasAgg, comprasAgg] = await Promise.all([
    db.sale.aggregate({ _sum: { total: true } }),
    db.purchase.aggregate({ _sum: { amount: true } }),
  ]);

  const recebidoVendas = Number(vendasAgg._sum.total ?? 0);
  const gastoIngredientes = Number(comprasAgg._sum.amount ?? 0);
  const saldo = recebidoVendas - gastoIngredientes;

  const maxVal = Math.max(recebidoVendas, gastoIngredientes, 1);
  const larguraVendas = (recebidoVendas / maxVal) * 100;
  const larguraIngredientes = (gastoIngredientes / maxVal) * 100;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-3xl font-bold text-candy-brown">Relatórios</h1>
      <p className="mb-6 text-sm text-candy-brown-light">
        Comparação entre o total recebido em vendas e o total gasto comprando
        ingredientes ao longo do tempo.
      </p>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-candy-pink bg-white p-5">
          <MoneyIcon className="h-8 w-8 text-candy-brown-light" />
          <div>
            <p className="text-sm text-candy-brown-light">Recebido em vendas</p>
            <p className="text-2xl font-bold text-candy-brown">
              {formatBRL(recebidoVendas)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-candy-pink bg-white p-5">
          <StockIcon className="h-8 w-8 text-candy-brown-light" />
          <div>
            <p className="text-sm text-candy-brown-light">
              Gasto em ingredientes
            </p>
            <p className="text-2xl font-bold text-candy-brown">
              {formatBRL(gastoIngredientes)}
            </p>
          </div>
        </div>
      </div>

      {/* Grafico de barras */}
      <div className="mt-6 rounded-2xl border-2 border-candy-pink bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-candy-brown">
          Comparativo
        </h2>

        <div className="flex flex-col gap-5">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-candy-brown">Vendas</span>
              <span className="text-candy-brown-light">
                {formatBRL(recebidoVendas)}
              </span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-full bg-candy-pink-light">
              <div
                className="h-full rounded-full bg-candy-brown"
                style={{ width: `${larguraVendas}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-candy-brown">Ingredientes</span>
              <span className="text-candy-brown-light">
                {formatBRL(gastoIngredientes)}
              </span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-full bg-candy-pink-light">
              <div
                className="h-full rounded-full bg-candy-pink"
                style={{ width: `${larguraIngredientes}%` }}
              />
            </div>
          </div>
        </div>

        {/* Saldo */}
        <div className="mt-6 flex items-center justify-between border-t border-candy-pink-light pt-4">
          <span className="font-medium text-candy-brown">
            Saldo (vendas − ingredientes)
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
        Observação: o gasto em ingredientes vem do histórico de compras (cada vez
        que você cadastra um ingrediente com quantidade ou clica em &quot;comprei&quot;).
        Usar o estoque não diminui esse valor.
      </p>
    </div>
  );
}
