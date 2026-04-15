import "dotenv/config";
import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const student = await prisma.student.upsert({
    where: { document: "00000000000" },
    update: {},
    create: {
      name: "Seed Student",
      document: "00000000000",
      birthDate: new Date("1990-01-01"),
      schoolId: "seed-school-id",
    },
  });

  console.log("Seed concluído:");
  console.log(`  Aluno: ${student.name} (document: ${student.document})`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
