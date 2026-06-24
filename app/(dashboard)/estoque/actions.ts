"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { UNITS } from "@/lib/format";

export type ActionResult = { ok: true } | { ok: false; error: string };

const ingredientSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do ingrediente."),
  unit: z.enum(UNITS, { error: "Escolha uma unidade válida." }),
  quantityCurrent: z
    .number()
    .min(0, "A quantidade não pode ser negativa.")
    .max(9999999, "Quantidade muito alta."),
  quantityMin: z
    .number()
    .min(0, "A quantidade mínima não pode ser negativa.")
    .max(9999999, "Quantidade muito alta."),
  unitCost: z
    .number()
    .min(0, "O custo não pode ser negativo.")
    .max(99999999, "Custo muito alto."),
});

const round3 = (n: number) => Math.round(n * 1000) / 1000;
const round2 = (n: number) => Math.round(n * 100) / 100;

function revalidateAll() {
  revalidatePath("/estoque");
  revalidatePath("/relatorios");
  revalidatePath("/");
}

export async function createIngredient(input: {
  name: string;
  unit: string;
  quantityCurrent: number;
  quantityMin: number;
  unitCost: number;
}): Promise<ActionResult> {
  const parsed = ingredientSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const created = await db.ingredient.create({ data: parsed.data });

  // A quantidade inicial cadastrada conta como uma compra (gasto permanente).
  if (created.quantityCurrent > 0) {
    await db.purchase.create({
      data: {
        ingredientId: created.id,
        ingredientName: created.name,
        quantity: created.quantityCurrent,
        unitCost: parsed.data.unitCost,
        amount: round2(created.quantityCurrent * parsed.data.unitCost),
      },
    });
  }

  revalidateAll();
  return { ok: true };
}

export async function updateIngredient(input: {
  id: string;
  name: string;
  unit: string;
  quantityCurrent: number;
  quantityMin: number;
  unitCost: number;
}): Promise<ActionResult> {
  const parsed = ingredientSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  // Editar e uma correcao manual: ajusta o estoque, mas NAO mexe no relatorio.
  await db.ingredient.update({
    where: { id: input.id },
    data: parsed.data,
  });
  revalidateAll();
  return { ok: true };
}

// "Comprei mais": aumenta o estoque E registra o gasto no relatorio.
export async function buyStock(input: {
  id: string;
  quantity: number;
}): Promise<ActionResult> {
  const quantity = round3(input.quantity);
  if (quantity <= 0) {
    return { ok: false, error: "A quantidade comprada deve ser maior que zero." };
  }

  const ingredient = await db.ingredient.findUnique({ where: { id: input.id } });
  if (!ingredient) {
    return { ok: false, error: "Ingrediente não encontrado." };
  }

  const unitCost = Number(ingredient.unitCost);
  const novaQtd = round3(ingredient.quantityCurrent + quantity);

  await db.ingredient.update({
    where: { id: input.id },
    data: { quantityCurrent: novaQtd },
  });
  await db.purchase.create({
    data: {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      quantity,
      unitCost,
      amount: round2(quantity * unitCost),
    },
  });

  revalidateAll();
  return { ok: true };
}

// "Usei": baixa o estoque (sem deixar negativo) e NAO mexe no relatorio.
export async function consumeStock(input: {
  id: string;
  quantity: number;
}): Promise<ActionResult> {
  const quantity = round3(input.quantity);
  if (quantity <= 0) {
    return { ok: false, error: "A quantidade usada deve ser maior que zero." };
  }

  const ingredient = await db.ingredient.findUnique({ where: { id: input.id } });
  if (!ingredient) {
    return { ok: false, error: "Ingrediente não encontrado." };
  }

  const novaQtd = Math.max(0, round3(ingredient.quantityCurrent - quantity));
  await db.ingredient.update({
    where: { id: input.id },
    data: { quantityCurrent: novaQtd },
  });

  revalidateAll();
  return { ok: true };
}

export async function deleteIngredient(input: {
  id: string;
}): Promise<ActionResult> {
  // As compras ficam no historico (ingredientId vira null), preservando o relatorio.
  await db.ingredient.delete({ where: { id: input.id } });
  revalidateAll();
  return { ok: true };
}
