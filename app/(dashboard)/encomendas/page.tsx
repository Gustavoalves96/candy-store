import { db } from "@/lib/db";
import { SaleForm } from "@/components/sale-form";
import { SalePaidControl } from "@/components/sale-paid-control";
import { CalendarIcon } from "@/components/icons";
import { formatBRL, formatDateBR, startOfTodaySP } from "@/lib/format";

export default async function EncomendasPage() {
  const [activeProducts, encomendas] = await Promise.all([
    db.product.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    db.sale.findMany({
      where: { deliveryDate: { not: null } },
      orderBy: { deliveryDate: "asc" },
      include: { items: { include: { product: true } } },
    }),
  ]);

  const productOptions = activeProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
  }));

  const hojeInicio = startOfTodaySP().getTime();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold text-candy-brown">Encomendas</h1>

      <h2 className="mb-3 text-xl font-semibold text-candy-brown">
        Nova encomenda
      </h2>
      <SaleForm products={productOptions} mode="encomenda" />

      <h2 className="mb-3 mt-8 text-xl font-semibold text-candy-brown">
        Próximas entregas
      </h2>
      {encomendas.length === 0 ? (
        <div className="rounded-2xl border-2 border-candy-pink bg-white p-6 text-center text-candy-brown-light">
          Nenhuma encomenda registrada ainda.
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {encomendas.map((enc) => {
            const entrega = enc.deliveryDate!;
            const atrasada = entrega.getTime() < hojeInicio;
            const qtdItens = enc.items.reduce((acc, i) => acc + i.quantity, 0);
            return (
              <li
                key={enc.id}
                className={`rounded-2xl border-2 bg-white p-4 ${
                  atrasada ? "border-amber-300" : "border-candy-pink"
                }`}
              >
                <div className="flex items-start justify-between gap-4 border-b border-candy-pink-light pb-3">
                  <div>
                    <p className="text-lg font-semibold text-candy-brown">
                      {enc.customerName}
                    </p>
                    <p
                      className={`flex items-center gap-1 text-sm ${
                        atrasada
                          ? "font-medium text-amber-700"
                          : "text-candy-brown-light"
                      }`}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      Entrega: {formatDateBR(entrega)}
                      {atrasada && " (atrasada)"}
                    </p>
                    <p className="text-sm text-candy-brown-light">
                      {qtdItens} {qtdItens === 1 ? "item" : "itens"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xl font-bold text-candy-brown">
                      {formatBRL(enc.total)}
                    </span>
                    <SalePaidControl id={enc.id} paid={enc.paid} />
                  </div>
                </div>

                <ul className="mt-3 flex flex-col gap-1">
                  {enc.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-candy-text">
                        <span className="font-medium">{item.quantity}×</span>{" "}
                        {item.product.name}
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
