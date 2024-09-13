import { theaters } from "../src/data/theaters";
import { articles } from "../src/data/articles";
import { PrismaClient } from "@prisma/client";
import { screens } from "../src/data/screens";

const prisma = new PrismaClient();

async function main() {
  await prisma.article.createMany({
    data: articles,
  });

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

  for (const screen of screens){
    await prisma.screen.upsert({
      where: { id: screen.id },
      update: {
        name: screen.name,
        theater_id: screen.theater_id,
      },
      create: {
        id: screen.id,
        name: screen.name,
        theater_id: screen.theater_id,
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
