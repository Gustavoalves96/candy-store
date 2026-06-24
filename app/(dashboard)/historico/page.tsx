import { db } from "@/lib/db";
import { formatBRL, formatDateTimeBR } from "@/lib/format";

export default async function HistoricoPage() {
  const sales = await db.sale.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold text-candy-brown">Histórico</h1>

      {sales.length === 0 ? (
        <div className="rounded-2xl border-2 border-candy-pink bg-white p-6 text-center text-candy-brown-light">
          Nenhuma venda registrada ainda.
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {sales.map((sale) => {
            const qtdItens = sale.items.reduce((acc, i) => acc + i.quantity, 0);
            return (
              <li
                key={sale.id}
                className="rounded-2xl border-2 border-candy-pink bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4 border-b border-candy-pink-light pb-3">
                  <div>
                    <p className="text-lg font-semibold text-candy-brown">
                      {sale.customerName}
                    </p>
                    <p className="text-sm text-candy-brown-light">
                      {formatDateTimeBR(sale.createdAt)} · {qtdItens}{" "}
                      {qtdItens === 1 ? "item" : "itens"}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-candy-brown">
                    {formatBRL(sale.total)}
                  </span>
                </div>

                <ul className="mt-3 flex flex-col gap-1">
                  {sale.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-candy-text">
                        <span className="font-medium">{item.quantity}×</span>{" "}
                        {item.product.name}
                        <span className="text-candy-brown-light">
                          {" "}
                          ({formatBRL(item.unitPrice)} cada)
                        </span>
                      </span>
                      <span className="font-medium text-candy-brown">
                        {formatBRL(item.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
