# Candy Store — Sistema de Estoque e Vendas

> **Como usar este documento:**
> 1. Abra um chat novo (ou o Claude Code na pasta do projeto) e cole este arquivo na primeira mensagem.
> 2. Peça para construir **um módulo por vez**, na ordem da seção 8. Não tente fazer tudo de uma vez — fica mais fácil de testar e gasta menos tokens.
> 3. No Claude Code, deixe este arquivo salvo como `CONTEXT.md` na raiz do projeto para consulta a qualquer momento.

---

## 1. Visão geral

Sistema web para minha mãe gerenciar a confeitaria dela. Duas funções principais: **controle de estoque de ingredientes** e **registro de vendas**. A pessoa que usa no dia a dia é minha mãe (não é técnica), então a prioridade é ser **simples e intuitivo**.

## 2. Stack técnica (já decidida)

- **Framework:** Next.js (App Router) — full-stack, front e back no mesmo projeto, usando Server Actions / Route Handlers para a lógica de backend.
- **Hospedagem:** Vercel.
- **Banco de dados:** Neon (PostgreSQL serverless).
- **Autenticação:** Auth.js (NextAuth v5).
- **ORM sugerido:** Prisma (mais amigável, tem GUI com `prisma studio`). Alternativa mais leve: Drizzle ORM, que integra muito bem com o driver serverless da Neon. *Escolha um e siga com ele.*
- **Estilização sugerida:** Tailwind CSS.
- **Linguagem:** TypeScript.

## 3. Sobre o negócio

- **Nome:** Candy Store
- **Produtos:** Cones (vários sabores), Brownies, Palha italiana, Lemon square

## 4. Identidade visual

- **Paleta:** rosa e marrom. **Tom:** aconchegante, artesanal, "feito em casa".
- **Sugestão de cores** (use como variáveis de tema no Tailwind):
  - Rosa principal: `#E89BB0`
  - Rosa claro / fundo: `#FBEEF1`
  - Marrom (chocolate): `#5C3A2E`
  - Marrom claro / detalhes: `#A6755C`
  - Texto / contraste: `#3D2B25`
- Telas limpas, botões grandes, poucos cliques por tarefa. Tudo em **português** e valores em **Reais (R$)**.

## 5. Modelo do banco de dados

Cinco tabelas. Descrição tech-agnostic primeiro, depois o schema Prisma pronto.

| Tabela | Para que serve | Campos principais |
|---|---|---|
| `users` | Login (só a minha mãe por enquanto) | id, name, email, passwordHash, createdAt |
| `ingredients` | Estoque de insumos | id, name, unit, quantityCurrent, quantityMin, updatedAt |
| `products` | Catálogo de doces com preço | id, name, price, active, createdAt |
| `sales` | Cada venda registrada | id, customerName, total, createdAt |
| `saleItems` | Itens de cada venda (1 venda = vários itens) | id, saleId, productId, quantity, unitPrice, subtotal |

### Schema Prisma (ponto de partida)

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model Ingredient {
  id              String   @id @default(cuid())
  name            String
  unit            String   // "kg", "g", "l", "ml", "un"
  quantityCurrent Float    @default(0)
  quantityMin     Float    @default(0)
  updatedAt       DateTime @updatedAt
  createdAt       DateTime @default(now())
}

model Product {
  id        String      @id @default(cuid())
  name      String
  price     Decimal     @db.Decimal(10, 2)
  active    Boolean     @default(true)
  createdAt DateTime    @default(now())
  saleItems SaleItem[]
}

model Sale {
  id           String     @id @default(cuid())
  customerName String
  total        Decimal    @db.Decimal(10, 2)
  createdAt    DateTime   @default(now())
  items        SaleItem[]
}

model SaleItem {
  id        String  @id @default(cuid())
  sale      Sale    @relation(fields: [saleId], references: [id], onDelete: Cascade)
  saleId    String
  product   Product @relation(fields: [productId], references: [id])
  productId String
  quantity  Int
  unitPrice Decimal @db.Decimal(10, 2)
  subtotal  Decimal @db.Decimal(10, 2)
}
```

> **Futuro (opcional):** ligar ingredientes aos produtos via uma tabela de "receita" para dar baixa automática no estoque a cada venda. Não fazer agora — primeiro o básico funcionando.

## 6. Estrutura de pastas sugerida

```
candy-store/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx           # tela de login
│   ├── (dashboard)/
│   │   ├── layout.tsx               # menu lateral, protege rotas
│   │   ├── page.tsx                 # painel inicial / resumo
│   │   ├── vendas/
│   │   │   ├── page.tsx             # registrar venda + histórico
│   │   │   └── actions.ts          # server actions de venda
│   │   └── estoque/
│   │       ├── page.tsx             # lista de ingredientes + alertas
│   │       └── actions.ts          # server actions de estoque
│   ├── api/
│   │   └── auth/[...nextauth]/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/                      # botões, tabelas, formulários reutilizáveis
├── lib/
│   ├── db.ts                        # cliente Prisma/Drizzle conectado ao Neon
│   └── auth.ts                      # configuração do Auth.js
├── prisma/
│   └── schema.prisma
├── .env.local                       # NUNCA commitar
└── package.json
```

## 7. Variáveis de ambiente

Criar `.env.local` (e configurar as mesmas na Vercel depois):

```
DATABASE_URL="...string de conexão da Neon..."
AUTH_SECRET="...gerar com: npx auth secret..."
```

> A string da Neon fica no painel do projeto na Neon, em "Connection Details". Use a versão **pooled** para serverless.

## 8. Ordem de construção (faça um por vez)

1. **Setup base:** criar o projeto Next.js + Tailwind + TypeScript, conectar no Neon, rodar a primeira migration do schema. Testar que conecta.
2. **Autenticação:** Auth.js com login por e-mail e senha (Credentials provider). Criar um usuário "semente" (seed) para a minha mãe. Proteger as rotas do `(dashboard)`.
3. **Módulo Vendas (começar por aqui):**
   - Cadastro de produtos com preço editável.
   - Tela para registrar venda: nome do cliente + adicionar itens (produto x quantidade) + total calculado automaticamente.
   - Histórico de vendas com data.
   - Extra: total do dia / do mês.
4. **Módulo Estoque:**
   - CRUD de ingredientes (nome, unidade, quantidade atual, quantidade mínima).
   - Botões para aumentar/diminuir quantidade.
   - **Alerta visual** quando `quantityCurrent < quantityMin` (linha vermelha + lista de "faltando").

## 9. Requisitos de qualidade

- Simplicidade acima de tudo: telas limpas, botões grandes.
- Validar formulários (não deixar salvar venda sem itens, preço negativo, etc).
- Tratar erros com mensagens claras em português.
- Layout responsivo (ela pode usar no celular).

## 10. Instruções para o Claude Code

- Antes de codar cada módulo, **mostre um plano curto em etapas** e qual será a aparência da tela principal. Só depois implemente.
- Trabalhe **um módulo por vez** (seção 8). Não pule etapas.
- Pode rodar os comandos de setup (`create-next-app`, instalar Prisma/Tailwind, gerar migrations). Me avise antes de qualquer comando destrutivo.
- Use TypeScript com tipos explícitos e Server Actions para a lógica de backend.
- Faça commits pequenos e descritivos a cada parte concluída.
- Não exponha segredos no código; tudo sensível vai em `.env.local`.
- Ao terminar um módulo, sugira um teste manual rápido para eu validar antes de seguir.

## 11. Primeira mensagem sugerida para o novo chat

> "Esse é o contexto completo do projeto Candy Store (acima). Vamos começar pela **etapa 1 (Setup base)** da seção 8. Antes de rodar qualquer comando, me mostre o plano de setup e a lista de comandos que vai executar. Stack: Next.js App Router + TypeScript + Tailwind + Prisma + Neon + Auth.js."
