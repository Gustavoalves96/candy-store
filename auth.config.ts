import type { NextAuthConfig } from "next-auth";

// Config "leve" do Auth.js — sem acesso ao banco nem bcrypt, para poder
// rodar no middleware (edge). A logica de senha fica em auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // os providers reais sao adicionados em auth.ts
  callbacks: {
    // Decide quem pode acessar cada rota. Tudo que NAO for /login exige login.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        // Ja logado tentando ver o login? Manda pro painel.
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // Qualquer outra rota exige estar logado.
      return isLoggedIn;
    },
    // Guarda o id do usuario no token e na sessao.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
