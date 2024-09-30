import { theaters } from "../src/data/theaters";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  for (const theater of theaters) {
    await prisma.theater.upsert({
      where: { id: theater.id },
      update: {
        name: theater.name,
        address: theater.address,
      },
      create: {
        id: theater.id,
        name: theater.name,
        address: theater.address,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
