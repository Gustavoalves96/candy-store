import Link from "next/link";
import { db } from "@/lib/db";
import { ProductManager } from "@/components/product-manager";

export default async function ProdutosPage() {
  const products = await db.product.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  const dto = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    active: p.active,
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-candy-brown">Produtos</h1>
        <Link
          href="/vendas"
          className="rounded-xl border border-candy-pink px-4 py-2 text-sm font-medium text-candy-brown hover:bg-candy-pink-light"
        >
          Ir para Vendas
        </Link>
      </div>

      <ProductManager products={dto} />
    </div>
  );
}
