import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// O proxy (antigo "middleware") usa apenas a config leve (sem banco/bcrypt),
// por isso roda no edge.
// A regra de quem pode acessar cada rota esta em authConfig.callbacks.authorized.
export default NextAuth(authConfig).auth;

export const config = {
  // Roda em todas as rotas, menos a API, recursos internos do Next, o favicon
  // e arquivos estaticos (imagens) — assim o logo carrega mesmo deslogado.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
