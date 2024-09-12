import { theaters } from "../src/data/theaters";
import { articles } from "../src/data/articles";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.article.createMany({
    data: articles,
  });

  
  await prisma.theater.createMany({
    data: theaters,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
