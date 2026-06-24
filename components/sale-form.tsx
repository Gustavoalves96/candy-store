"use client";

import { useState, useTransition } from "react";
import { createSale } from "@/app/(dashboard)/vendas/actions";
import { formatBRL } from "@/lib/format";
import { PlusIcon, TrashIcon } from "@/components/icons";

type ProductOption = { id: string; name: string; price: number };
type ItemRow = { key: number; productId: string; quantity: number };

export function SaleForm({ products }: { products: ProductOption[] }) {
  const [isPending, startTransition] = useTransition();
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<ItemRow[]>([
    { key: 1, productId: "", quantity: 1 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [nextKey, setNextKey] = useState(2);

  const priceById = new Map(products.map((p) => [p.id, p.price]));

  function subtotalOf(row: ItemRow): number {
    const price = priceById.get(row.productId) ?? 0;
    return price * row.quantity;
  }
  const total = items.reduce((acc, row) => acc + subtotalOf(row), 0);

  function addRow() {
    setItems((prev) => [
      ...prev,
      { key: nextKey, productId: "", quantity: 1 },
    ]);
    setNextKey((k) => k + 1);
  }

  function removeRow(key: number) {
    setItems((prev) =>
      prev.length === 1 ? prev : prev.filter((r) => r.key !== key),
    );
  }

  function updateRow(key: number, patch: Partial<ItemRow>) {
    setItems((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!customerName.trim()) {
      return setError("Informe o nome do cliente.");
    }
    const chosen = items.filter((r) => r.productId !== "");
    if (chosen.length === 0) {
      return setError("Adicione pelo menos um item à venda.");
    }
    if (chosen.some((r) => r.quantity < 1)) {
      return setError("A quantidade de cada item deve ser pelo menos 1.");
    }

    startTransition(async () => {
      const result = await createSale({
        customerName,
        items: chosen.map((r) => ({
          productId: r.productId,
          quantity: r.quantity,
        })),
      });
      if (result.ok) {
        setCustomerName("");
        setItems([{ key: 1, productId: "", quantity: 1 }]);
        setNextKey(2);
        setSuccess("Venda registrada com sucesso!");
      } else {
        setError(result.error);
      }
    });
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-candy-pink bg-white p-6 text-center">
        <p className="text-candy-brown">
          Você ainda não tem produtos cadastrados.
        </p>
        <a
          href="/produtos"
          className="mt-3 inline-block rounded-xl bg-candy-brown px-4 py-2 font-semibold text-white hover:bg-candy-brown-light"
        >
          Cadastrar produtos
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border-2 border-candy-pink bg-white p-4"
    >
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-candy-brown">Cliente</span>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nome do cliente"
          className="rounded-xl border border-candy-pink px-3 py-2 outline-none focus:ring-2 focus:ring-candy-pink"
        />
      </label>

      <div className="mt-4 flex flex-col gap-2">
        {items.map((row) => (
          <div key={row.key} className="flex flex-wrap items-center gap-2">
            <select
              value={row.productId}
              onChange={(e) => updateRow(row.key, { productId: e.target.value })}
              className="min-w-40 flex-1 rounded-xl border border-candy-pink bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-candy-pink"
            >
              <option value="">Escolha um produto…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatBRL(p.price)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              step={1}
              value={row.quantity}
              onChange={(e) =>
                updateRow(row.key, {
                  quantity: Math.max(1, Number(e.target.value) || 1),
                })
              }
              className="w-20 rounded-xl border border-candy-pink px-3 py-2 text-center outline-none focus:ring-2 focus:ring-candy-pink"
            />
            <span className="w-24 text-right font-semibold text-candy-brown">
              {formatBRL(subtotalOf(row))}
            </span>
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              title="Remover item"
              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-3 flex items-center gap-2 rounded-xl border border-candy-pink px-3 py-2 text-sm font-medium text-candy-brown hover:bg-candy-pink-light"
      >
        <PlusIcon className="h-4 w-4" />
        Adicionar item
      </button>

      <div className="mt-4 flex items-center justify-between border-t border-candy-pink-light pt-4">
        <span className="text-lg font-medium text-candy-brown">Total</span>
        <span className="text-2xl font-bold text-candy-brown">
          {formatBRL(total)}
        </span>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-3 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 w-full rounded-xl bg-candy-brown px-4 py-3 text-lg font-semibold text-white transition-colors hover:bg-candy-brown-light disabled:opacity-60"
      >
        {isPending ? "Registrando…" : "Registrar venda"}
      </button>
    </form>
  );
}
