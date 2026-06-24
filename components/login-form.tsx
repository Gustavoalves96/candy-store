"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/(auth)/login/actions";

export function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 text-left">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="font-medium text-candy-brown">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-xl border border-candy-pink bg-white px-4 py-3 text-base outline-none focus:border-candy-brown-light focus:ring-2 focus:ring-candy-pink"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="font-medium text-candy-brown">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-xl border border-candy-pink bg-white px-4 py-3 text-base outline-none focus:border-candy-brown-light focus:ring-2 focus:ring-candy-pink"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-xl bg-candy-brown px-4 py-3 text-lg font-semibold text-white transition-colors hover:bg-candy-brown-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </button>

      {errorMessage && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
