"use client";

import { useState, useTransition } from "react";
import { setSalePaid } from "@/app/(dashboard)/vendas/actions";

// Badge clicavel com o status de pagamento da venda.
// Clicar alterna entre "Pago" e "Não pago".
export function SalePaidControl({
  id,
  paid,
}: {
  id: string;
  paid: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState(paid);

  function toggle() {
    const novo = !current;
    setCurrent(novo); // atualiza na hora
    startTransition(async () => {
      const res = await setSalePaid({ id, paid: novo });
      if (!res.ok) setCurrent(!novo); // desfaz se der erro
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      title={
        current
          ? "Pago — clique para marcar como em aberto"
          : "Em aberto — clique para marcar como pago"
      }
      className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors disabled:opacity-60 ${
        current
          ? "border-green-300 bg-green-100 text-green-700 hover:bg-green-200"
          : "border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200"
      }`}
    >
      {current ? "Pago" : "Não pago"}
    </button>
  );
}
