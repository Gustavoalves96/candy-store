import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

// Cria (ou atualiza) o usuario que vai logar no sistema.
// Os dados vem de variaveis de ambiente para nao ficarem escritos no codigo:
//   SEED_NAME, SEED_EMAIL, SEED_PASSWORD
async function main() {
  const name = process.env.SEED_NAME;
  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Defina SEED_NAME, SEED_EMAIL e SEED_PASSWORD antes de rodar o seed.",
    );
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const db = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { name, email, passwordHash },
  });

  console.log(`Usuario pronto: ${user.name} <${user.email}>`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
