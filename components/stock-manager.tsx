"use client";

import { useState, useTransition } from "react";
import {
  createIngredient,
  updateIngredient,
  adjustQuantity,
  deleteIngredient,
  type ActionResult,
} from "@/app/(dashboard)/estoque/actions";
import {
  UNITS,
  formatQty,
  formatBRL,
  parseQuantity,
  parsePrice,
} from "@/lib/format";
import {
  PlusIcon,
  MinusIcon,
  PencilIcon,
  TrashIcon,
  AlertIcon,
  MoneyIcon,
} from "@/components/icons";

export type IngredientDTO = {
  id: string;
  name: string;
  unit: string;
  quantityCurrent: number;
  quantityMin: number;
  unitCost: number;
};

export function StockManager({
  ingredients,
}: {
  ingredients: IngredientDTO[];
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // Form de novo ingrediente
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<string>("kg");
  const [current, setCurrent] = useState("");
  const [min, setMin] = useState("");
  const [cost, setCost] = useState("");

  // Edicao inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("kg");
  const [editCurrent, setEditCurrent] = useState("");
  const [editMin, setEditMin] = useState("");
  const [editCost, setEditCost] = useState("");

  const faltando = ingredients.filter((i) => i.quantityCurrent < i.quantityMin);
  const totalEstoque = ingredients.reduce(
    (acc, i) => acc + i.unitCost * i.quantityCurrent,
    0,
  );

  function run(action: () => Promise<ActionResult>, onOk?: () => void) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) onOk?.();
      else setMessage(result.error);
    });
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const atual = parseQuantity(current || "0");
    const minimo = parseQuantity(min || "0");
    const custo = parsePrice(cost || "0");
    if (!name.trim()) return setMessage("Informe o nome do ingrediente.");
    if (atual === null) return setMessage("Quantidade atual inválida.");
    if (minimo === null) return setMessage("Quantidade mínima inválida.");
    if (custo === null) return setMessage("Custo inválido (ex: 5,00).");

    run(
      () =>
        createIngredient({
          name,
          unit,
          quantityCurrent: atual,
          quantityMin: minimo,
          unitCost: custo,
        }),
      () => {
        setName("");
        setUnit("kg");
        setCurrent("");
        setMin("");
        setCost("");
      },
    );
  }

  function startEdit(i: IngredientDTO) {
    setEditingId(i.id);
    setEditName(i.name);
    setEditUnit(i.unit);
    setEditCurrent(String(i.quantityCurrent).replace(".", ","));
    setEditMin(String(i.quantityMin).replace(".", ","));
    setEditCost(String(i.unitCost).replace(".", ","));
    setMessage(null);
  }

  function handleSaveEdit(id: string) {
    const atual = parseQuantity(editCurrent || "0");
    const minimo = parseQuantity(editMin || "0");
    const custo = parsePrice(editCost || "0");
    if (!editName.trim()) return setMessage("Informe o nome do ingrediente.");
    if (atual === null) return setMessage("Quantidade atual inválida.");
    if (minimo === null) return setMessage("Quantidade mínima inválida.");
    if (custo === null) return setMessage("Custo inválido (ex: 5,00).");

    run(
      () =>
        updateIngredient({
          id,
          name: editName,
          unit: editUnit,
          quantityCurrent: atual,
          quantityMin: minimo,
          unitCost: custo,
        }),
      () => setEditingId(null),
    );
  }

  const inputCls =
    "rounded-xl border border-candy-pink px-3 py-2 outline-none focus:ring-2 focus:ring-candy-pink";

  return (
    <div className="flex flex-col gap-6">
      {/* Total em estoque */}
      <div className="flex items-center gap-3 rounded-2xl border-2 border-candy-pink bg-white p-5">
        <MoneyIcon className="h-8 w-8 text-candy-brown-light" />
        <div>
          <p className="text-sm text-candy-brown-light">Total em estoque</p>
          <p className="text-2xl font-bold text-candy-brown">
            {formatBRL(totalEstoque)}
          </p>
        </div>
      </div>

      {/* Alerta de itens faltando */}
      {faltando.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-red-700">
          <AlertIcon className="mt-0.5 h-6 w-6 shrink-0" />
          <div>
            <p className="font-semibold">Faltando no estoque</p>
            <p className="text-sm">{faltando.map((i) => i.name).join(", ")}</p>
          </div>
        </div>
      )}

      {/* Novo ingrediente */}
      <form
        onSubmit={handleAdd}
        className="rounded-2xl border-2 border-candy-pink bg-white p-4"
      >
        <h2 className="mb-3 text-lg font-semibold text-candy-brown">
          Novo ingrediente
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          <label className="col-span-2 flex flex-col gap-1">
            <span className="text-sm font-medium text-candy-brown">Nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Farinha"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-candy-brown">Unidade</span>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className={`${inputCls} bg-white`}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-candy-brown">Atual</span>
            <input
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-candy-brown">Mínima</span>
            <input
              value={min}
              onChange={(e) => setMin(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-candy-brown">
              Custo (R$)
            </span>
            <input
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              inputMode="decimal"
              placeholder="por unidade"
              className={inputCls}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-candy-brown px-4 py-2 font-semibold text-white transition-colors hover:bg-candy-brown-light disabled:opacity-60"
        >
          <PlusIcon className="h-5 w-5" />
          Adicionar
        </button>
      </form>

      {message && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {message}
        </p>
      )}

      {/* Lista */}
      <div className="overflow-hidden rounded-2xl border-2 border-candy-pink bg-white">
        {ingredients.length === 0 ? (
          <p className="p-6 text-center text-candy-brown-light">
            Nenhum ingrediente cadastrado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-candy-pink-light">
            {ingredients.map((i) => {
              const baixo = i.quantityCurrent < i.quantityMin;
              const editando = editingId === i.id;
              const valorItem = i.unitCost * i.quantityCurrent;

              return (
                <li
                  key={i.id}
                  className={`p-4 ${baixo && !editando ? "bg-red-50" : ""}`}
                >
                  {editando ? (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={`col-span-2 ${inputCls}`}
                        />
                        <select
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value)}
                          className={`${inputCls} bg-white`}
                        >
                          {UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                        <input
                          value={editCurrent}
                          onChange={(e) => setEditCurrent(e.target.value)}
                          inputMode="decimal"
                          className={inputCls}
                          title="Quantidade atual"
                        />
                        <input
                          value={editMin}
                          onChange={(e) => setEditMin(e.target.value)}
                          inputMode="decimal"
                          className={inputCls}
                          title="Quantidade mínima"
                        />
                        <input
                          value={editCost}
                          onChange={(e) => setEditCost(e.target.value)}
                          inputMode="decimal"
                          className={inputCls}
                          title="Custo por unidade (R$)"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(i.id)}
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
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-candy-brown">{i.name}</p>
                        <p
                          className={`text-sm ${
                            baixo
                              ? "font-medium text-red-600"
                              : "text-candy-brown-light"
                          }`}
                        >
                          {formatQty(i.quantityCurrent)} {i.unit} · mín{" "}
                          {formatQty(i.quantityMin)} {i.unit} ·{" "}
                          {formatBRL(i.unitCost)}/{i.unit} ={" "}
                          {formatBRL(valorItem)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            run(() => adjustQuantity({ id: i.id, delta: -1 }))
                          }
                          disabled={isPending}
                          title="Diminuir 1"
                          className="rounded-lg border border-candy-pink p-2 text-candy-brown hover:bg-candy-pink-light disabled:opacity-60"
                        >
                          <MinusIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            run(() => adjustQuantity({ id: i.id, delta: 1 }))
                          }
                          disabled={isPending}
                          title="Aumentar 1"
                          className="rounded-lg border border-candy-pink p-2 text-candy-brown hover:bg-candy-pink-light disabled:opacity-60"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => startEdit(i)}
                          title="Editar"
                          className="rounded-lg p-2 text-candy-brown hover:bg-candy-pink-light"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            run(() => deleteIngredient({ id: i.id }))
                          }
                          disabled={isPending}
                          title="Excluir"
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-60"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
