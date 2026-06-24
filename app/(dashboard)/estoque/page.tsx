import { db } from "@/lib/db";
import { StockManager } from "@/components/stock-manager";

export default async function EstoquePage() {
  const ingredients = await db.ingredient.findMany({
    orderBy: { name: "asc" },
  });

  const dto = ingredients.map((i) => ({
    id: i.id,
    name: i.name,
    unit: i.unit,
    quantityCurrent: i.quantityCurrent,
    quantityMin: i.quantityMin,
    unitCost: Number(i.unitCost),
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold text-candy-brown">Estoque</h1>
      <StockManager ingredients={dto} />
    </div>
  );
}
