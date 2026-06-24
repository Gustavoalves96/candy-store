import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl border-2 border-candy-pink bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/candy_store_logo.png"
            alt="Candy Store"
            width={120}
            height={120}
            className="mb-3 rounded-full"
            unoptimized
            priority
          />
          <h1 className="text-2xl font-bold text-candy-brown">Candy Store</h1>
          <p className="mt-1 text-sm text-candy-brown-light">
            Entre para gerenciar a loja
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
