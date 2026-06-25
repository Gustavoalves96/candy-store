"use client";

import { useState, useTransition } from "react";
import {
  createProduct,
  updateProduct,
  toggleProductActive,
  deleteProduct,
  type ActionResult,
} from "@/app/(dashboard)/produtos/actions";
import { parsePrice, formatBRL } from "@/lib/format";
import { PlusIcon, PencilIcon, TrashIcon } from "@/components/icons";

export type ProductDTO = {
  id: string;
  name: string;
  price: number;
  active: boolean;
};

export function ProductManager({ products }: { products: ProductDTO[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // Form de novo produto
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  // Edicao inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  function run(action: () => Promise<ActionResult>, onOk?: () => void) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        onOk?.();
      } else {
        setMessage(result.error);
      }
    });
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const valor = parsePrice(price);
    if (!name.trim()) return setMessage("Informe o nome do produto.");
    if (valor === null) return setMessage("Informe um preço válido (ex: 8,50).");

    run(() => createProduct({ name, price: valor }), () => {
      setName("");
      setPrice("");
    });
  }

  function startEdit(p: ProductDTO) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price).replace(".", ","));
    setMessage(null);
  }

  function handleSaveEdit(id: string) {
    const valor = parsePrice(editPrice);
    if (!editName.trim()) return setMessage("Informe o nome do produto.");
    if (valor === null) return setMessage("Informe um preço válido (ex: 8,50).");

    run(
      () => updateProduct({ id, name: editName, price: valor }),
      () => setEditingId(null),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Novo produto */}
      <form
        onSubmit={handleAdd}
        className="rounded-2xl border-2 border-candy-pink bg-white p-4"
      >
        <h2 className="mb-3 text-lg font-semibold text-candy-brown">
          Novo produto
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium text-candy-brown">Nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Brownie"
              className="rounded-xl border border-candy-pink px-3 py-2 outline-none focus:ring-2 focus:ring-candy-pink"
            />
          </label>
          <label className="flex flex-col gap-1 sm:w-40">
            <span className="text-sm font-medium text-candy-brown">
              Preço (R$)
            </span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="8,50"
              className="rounded-xl border border-candy-pink px-3 py-2 outline-none focus:ring-2 focus:ring-candy-pink"
            />
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 rounded-xl bg-candy-brown px-4 py-2 font-semibold text-white transition-colors hover:bg-candy-brown-light disabled:opacity-60"
          >
            <PlusIcon className="h-5 w-5" />
            Adicionar
          </button>
        </div>
      </form>

      {message && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {message}
        </p>
      )}

      {/* Lista */}
      <div className="overflow-hidden rounded-2xl border-2 border-candy-pink bg-white">
        {products.length === 0 ? (
          <p className="p-6 text-center text-candy-brown-light">
            Nenhum produto cadastrado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-candy-pink-light">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-3 p-4"
              >
                {editingId === p.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded-lg border border-candy-pink px-3 py-2 outline-none focus:ring-2 focus:ring-candy-pink"
                    />
                    <input
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      inputMode="decimal"
                      className="w-28 rounded-lg border border-candy-pink px-3 py-2 outline-none focus:ring-2 focus:ring-candy-pink"
                    />
                    <button
                      onClick={() => handleSaveEdit(p.id)}
                      disabled={isPending}
                      className="rounded-lg bg-candy-brown px-3 py-2 text-sm font-semibold text-white hover:bg-candy-brown-light disabled:opacity-60"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-candy-pink px-3 py-2 text-sm text-candy-brown hover:bg-candy-pink-light"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-medium ${
                          p.active
                            ? "text-candy-brown"
                            : "text-candy-brown-light line-through"
                        }`}
                      >
                        {p.name}
                      </p>
                      <p className="text-sm text-candy-brown-light">
                        {formatBRL(p.price)}
                        {!p.active && " · inativo"}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={() => startEdit(p)}
                        title="Editar"
                        className="rounded-lg p-2 text-candy-brown hover:bg-candy-pink-light"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          run(() =>
                            toggleProductActive({ id: p.id, active: !p.active }),
                          )
                        }
                        disabled={isPending}
                        className="rounded-lg border border-candy-pink px-3 py-2 text-sm text-candy-brown hover:bg-candy-pink-light disabled:opacity-60"
                      >
                        {p.active ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => run(() => deleteProduct({ id: p.id }))}
                        disabled={isPending}
                        title="Excluir"
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-60"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
