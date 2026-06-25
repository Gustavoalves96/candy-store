"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

export type SaleResult = { ok: true } | { ok: false; error: string };

const saleSchema = z.object({
  customerName: z.string().trim().min(1, "Informe o nome do cliente."),
  paid: z.boolean(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z
          .number()
          .int("A quantidade deve ser um número inteiro.")
          .min(1, "A quantidade deve ser pelo menos 1."),
      }),
    )
    .min(1, "Adicione pelo menos um item à venda."),
});

export async function createSale(input: {
  customerName: string;
  paid: boolean;
  items: { productId: string; quantity: number }[];
}): Promise<SaleResult> {
  const parsed = saleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const { customerName, paid, items } = parsed.data;

  // Busca os precos atuais no banco — nunca confia no valor vindo do cliente.
  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await db.product.findMany({
    where: { id: { in: ids }, active: true },
  });
  const priceById = new Map(products.map((p) => [p.id, Number(p.price)]));

  // Garante que todo item aponta para um produto ativo existente.
  for (const item of items) {
    if (!priceById.has(item.productId)) {
      return {
        ok: false,
        error: "Há um produto inválido ou inativo na venda. Revise os itens.",
      };
    }
  }

  // Soma em centavos para evitar erros de ponto flutuante.
  let totalCents = 0;
  const saleItems = items.map((item) => {
    const unitPrice = priceById.get(item.productId)!;
    const subtotalCents = Math.round(unitPrice * 100) * item.quantity;
    totalCents += subtotalCents;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      subtotal: subtotalCents / 100,
    };
  });

  await db.sale.create({
    data: {
      customerName,
      total: totalCents / 100,
      paid,
      items: { create: saleItems },
    },
  });

  revalidatePath("/vendas");
  revalidatePath("/historico");
  revalidatePath("/relatorios");
  revalidatePath("/");
  return { ok: true };
}

// Marca uma venda como paga ou em aberto (clicando no status do historico).
export async function setSalePaid(input: {
  id: string;
  paid: boolean;
}): Promise<SaleResult> {
  await db.sale.update({
    where: { id: input.id },
    data: { paid: input.paid },
  });

  revalidatePath("/vendas");
  revalidatePath("/historico");
  revalidatePath("/relatorios");
  revalidatePath("/");
  return { ok: true };
}
