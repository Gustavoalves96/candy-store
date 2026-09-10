# 🍬 Candy Store — Sistema de Estoque e Vendas

Aplicação web full-stack para gerenciar uma confeitaria artesanal: controle de
**vendas**, **encomendas**, **estoque de ingredientes** e **relatórios**
financeiros. Pensada para ser simples e intuitiva, com foco em uso no celular.

> Projeto de portfólio. Interface, valores (R$) e textos em **português (pt-BR)**.

## ✨ Funcionalidades

- **Autenticação** por e-mail e senha (Auth.js / NextAuth v5), com rotas
  protegidas e senha protegida com bcrypt.
- **Produtos**: cadastro com preço editável e ativar/desativar.
- **Vendas**: registro com vários itens, **total calculado no servidor**,
  status de pagamento (**pago / em aberto**) e histórico.
- **Encomendas**: vendas com **data de entrega**, listadas por proximidade, com
  alerta da próxima entrega no painel.
- **Estoque**: ingredientes com unidade, quantidade mínima e **custo por
  unidade**; botões de "comprei" / "usei"; **alerta visual** quando abaixo do
  mínimo; **total em estoque**.
- **Relatórios**: comparativo entre vendas recebidas, valores em aberto e gasto
  em ingredientes (com histórico de compras permanente).
- **Painel** com resumo financeiro, alertas de estoque e atalhos.
- **Responsivo** (mobile-first): menu lateral no desktop e barra inferior no
  celular.

## 🧱 Stack

- **Next.js** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS v4** (tema rosa/marrom via `@theme`)
- **Prisma 7** (driver adapter `pg`) + **PostgreSQL** (Neon)
- **Auth.js / NextAuth v5** (Credentials)
- **Zod** para validação · **bcryptjs** para hash de senha
- Deploy na **Vercel**

## 📁 Estrutura

```
app/
  (auth)/login/          # tela de login
  (dashboard)/           # área protegida
    page.tsx             # painel inicial
    vendas/ encomendas/ historico/ estoque/ relatorios/ produtos/
  api/auth/[...nextauth] # rotas do Auth.js
components/              # formulários, menu, ícones SVG, etc.
lib/                     # cliente Prisma, formatação, auth helpers
prisma/                  # schema e migrations
```

## 🚀 Rodando localmente

Pré-requisitos: Node 20+ e um banco PostgreSQL (ex.: um projeto gratuito na
[Neon](https://neon.tech)).

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# edite o .env com a sua DATABASE_URL e gere o AUTH_SECRET:
npx auth secret

# 3. Criar as tabelas no banco
npx prisma migrate dev

# 4. Criar o usuário inicial (lê SEED_NAME / SEED_EMAIL / SEED_PASSWORD do .env)
npm run seed

# 5. Subir em desenvolvimento
npm run dev
```

Acesse http://localhost:3000 e faça login com o usuário do seed.

## 🗄️ Modelo de dados (resumo)

- `User` — login.
- `Product` — catálogo de doces com preço.
- `Sale` / `SaleItem` — vendas e seus itens; `Sale` tem `paid` e
  `deliveryDate` (quando é encomenda).
- `Ingredient` — estoque, com `unitCost`.
- `Purchase` — histórico permanente de compras de ingredientes (alimenta os
  relatórios sem diminuir quando o estoque é consumido).

## 📜 Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` | `prisma generate` + `prisma migrate deploy` + build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run seed` | Cria o usuário inicial |
