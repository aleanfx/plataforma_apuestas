// Seed: asegura que el usuario con ADMIN_EMAIL tenga rol admin.
// Se puede correr cuantas veces haga falta (idempotente).
import { prisma } from "../src/db.js";
import { env } from "../src/env.js";

async function main() {
  const email = env.ADMIN_EMAIL.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`Seed: aún no existe el usuario admin (${email}).`);
    console.log("   Regístralo desde la app y vuelve a correr `npm run seed`.");
  } else if (user.role !== "admin") {
    await prisma.user.update({ where: { email }, data: { role: "admin" } });
    console.log(`Seed: ${email} promovido a admin.`);
  } else {
    console.log(`Seed: ${email} ya es admin.`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
