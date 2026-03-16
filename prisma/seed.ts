import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const user = await prisma.student.upsert({
    where: { document: "00000000000" },
    update: {},
    create: {
      name: "Admin",
      document: "00000000000",
      password: hashedPassword,
      birthDate: new Date("1990-01-01"),
      schoolId: "seed-school-id",
    },
  });

  console.log("Seed concluído:");
  console.log(`  Usuário: ${user.name} (document: ${user.document})`);
  console.log("\nCredenciais de login:");
  console.log('  document: "00000000000"');
  console.log('  password: "admin123"');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
