"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

export type ActionResult = { ok: true } | { ok: false; error: string };

const productSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do produto."),
  price: z
    .number({ error: "Informe um preço válido." })
    .min(0, "O preço não pode ser negativo.")
    .max(99999999, "Preço muito alto."),
});

export async function createProduct(input: {
  name: string;
  price: number;
}): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await db.product.create({
    data: { name: parsed.data.name, price: parsed.data.price },
  });
  revalidatePath("/produtos");
  revalidatePath("/vendas");
  return { ok: true };
}

export async function updateProduct(input: {
  id: string;
  name: string;
  price: number;
}): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await db.product.update({
    where: { id: input.id },
    data: { name: parsed.data.name, price: parsed.data.price },
  });
  revalidatePath("/produtos");
  revalidatePath("/vendas");
  return { ok: true };
}

export async function toggleProductActive(input: {
  id: string;
  active: boolean;
}): Promise<ActionResult> {
  await db.product.update({
    where: { id: input.id },
    data: { active: input.active },
  });
  revalidatePath("/produtos");
  revalidatePath("/vendas");
  return { ok: true };
}

export async function deleteProduct(input: {
  id: string;
}): Promise<ActionResult> {
  // Nao deixa apagar um produto que ja foi usado em vendas (mantem o historico).
  const usos = await db.saleItem.count({ where: { productId: input.id } });
  if (usos > 0) {
    return {
      ok: false,
      error:
        "Este produto já tem vendas registradas. Em vez de apagar, desative-o.",
    };
  }

  await db.product.delete({ where: { id: input.id } });
  revalidatePath("/produtos");
  revalidatePath("/vendas");
  return { ok: true };
}
