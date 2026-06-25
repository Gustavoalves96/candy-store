import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { DashboardNav, MobileNav } from "@/components/dashboard-nav";
import { LogoutIcon } from "@/components/icons";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protecao extra (alem do middleware): sem sessao, volta para o login.
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  async function sair() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Cabecalho do mobile (fixo no topo) */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-candy-pink bg-white px-4 py-2 md:hidden">
        <div className="flex items-center gap-2">
          <Image
            src="/candy_store_logo.png"
            alt="Candy Store"
            width={36}
            height={36}
            className="rounded-full"
            unoptimized
            priority
          />
          <span className="text-lg font-bold text-candy-brown">
            Candy Store
          </span>
        </div>
        <form action={sair}>
          <button
            type="submit"
            title="Sair"
            className="flex items-center gap-1 rounded-xl border border-candy-pink px-3 py-2 text-sm font-medium text-candy-brown hover:bg-candy-pink-light"
          >
            <LogoutIcon className="h-4 w-4" />
            Sair
          </button>
        </form>
      </header>

      {/* Menu lateral (desktop) */}
      <aside className="hidden gap-4 border-candy-pink bg-white p-4 md:flex md:w-64 md:flex-col md:border-r-2">
        <div className="flex items-center gap-2">
          <Image
            src="/candy_store_logo.png"
            alt="Candy Store"
            width={44}
            height={44}
            className="rounded-full"
            unoptimized
            priority
          />
          <span className="text-xl font-bold text-candy-brown">
            Candy Store
          </span>
        </div>

        <DashboardNav />

        <div className="mt-auto flex flex-col gap-2 border-t border-candy-pink-light pt-4">
          <p className="px-1 text-sm text-candy-brown-light">
            {session.user.name ?? session.user.email}
          </p>
          <form action={sair}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-candy-pink px-4 py-2 text-sm font-medium text-candy-brown transition-colors hover:bg-candy-pink-light"
            >
              <LogoutIcon className="h-4 w-4" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Conteudo (espaco extra embaixo no mobile por causa da barra fixa) */}
      <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8">{children}</main>

      {/* Barra de navegacao do mobile (fixa embaixo) */}
      <MobileNav />
    </div>
  );
}
