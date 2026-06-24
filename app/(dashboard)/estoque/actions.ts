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
});

export async function createIngredient(input: {
  name: string;
  unit: string;
  quantityCurrent: number;
  quantityMin: number;
}): Promise<ActionResult> {
  const parsed = ingredientSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await db.ingredient.create({ data: parsed.data });
  revalidatePath("/estoque");
  return { ok: true };
}

export async function updateIngredient(input: {
  id: string;
  name: string;
  unit: string;
  quantityCurrent: number;
  quantityMin: number;
}): Promise<ActionResult> {
  const parsed = ingredientSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await db.ingredient.update({
    where: { id: input.id },
    data: parsed.data,
  });
  revalidatePath("/estoque");
  return { ok: true };
}

// Ajusta a quantidade atual por um delta (+/-), sem deixar ficar negativa.
export async function adjustQuantity(input: {
  id: string;
  delta: number;
}): Promise<ActionResult> {
  const ingredient = await db.ingredient.findUnique({
    where: { id: input.id },
  });
  if (!ingredient) {
    return { ok: false, error: "Ingrediente não encontrado." };
  }

  const novaQtd = Math.max(
    0,
    Math.round((ingredient.quantityCurrent + input.delta) * 1000) / 1000,
  );

  await db.ingredient.update({
    where: { id: input.id },
    data: { quantityCurrent: novaQtd },
  });
  revalidatePath("/estoque");
  return { ok: true };
}

export async function deleteIngredient(input: {
  id: string;
}): Promise<ActionResult> {
  await db.ingredient.delete({ where: { id: input.id } });
  revalidatePath("/estoque");
  return { ok: true };
}
