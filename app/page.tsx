export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border-2 border-candy-pink bg-white p-10 text-center shadow-sm">
        <div className="mb-4 text-5xl">🍬</div>
        <h1 className="text-3xl font-bold text-candy-brown">Candy Store</h1>
        <p className="mt-2 text-lg text-candy-brown-light">
          Sistema de Estoque e Vendas
        </p>

        <div className="mt-8 rounded-2xl bg-candy-pink-light p-4 text-sm text-candy-text">
          <p className="font-semibold">Etapa 1 — Setup base concluida ✅</p>
          <p className="mt-1">
            Next.js + TypeScript + Tailwind + Prisma + Neon prontos.
          </p>
        </div>
      </div>
    </main>
  );
}
