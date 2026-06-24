import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { DashboardNav } from "@/components/dashboard-nav";
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

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col gap-4 border-b-2 border-candy-pink bg-white p-4 md:w-64 md:border-b-0 md:border-r-2">
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
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
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

      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
