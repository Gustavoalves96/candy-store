"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

// Acao de login: tenta autenticar e, se der certo, o proprio signIn
// redireciona para "/". Em caso de erro, devolve uma mensagem em portugues.
export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return "E-mail ou senha incorretos.";
      }
      return "Algo deu errado ao entrar. Tente novamente.";
    }
    // Erros de redirecionamento do Next precisam continuar subindo.
    throw error;
  }
}
