import { theaters } from "../src/data/theaters";
import { PrismaClient } from "@prisma/client";
import { regions } from "../src/data/regions";

const prisma = new PrismaClient();

async function main() {

  for (const region of regions) {
    await prisma.region.upsert({
      where: { id: region.id },
      update: {
        name: region.name,
        name_kana: region.name_kana,
      },
      create: {
        id: region.id,
        name: region.name,
        name_kana: region.name_kana,
      },
    })

    for (const prefecture of region.prefecture) {
      await prisma.prefecture.upsert({
        where: { id: prefecture.id },
        update: {
          name: prefecture.name,
          name_kana: prefecture.name_kana,
          region_id: region.id,
        },
        create: {
          id: prefecture.id,
          name: prefecture.name,
          name_kana: prefecture.name_kana,
          region_id: region.id,
        },
      });
    }
  }

  for (const theater of theaters) {
    await prisma.theater.upsert({
      where: { id: theater.id },
      update: {
        name: theater.name,
        address: theater.address,
        url: theater.url ? theater.url : null,
        prefecture_id: theater.prefecture_id,
      },
      create: {
        id: theater.id,
        name: theater.name,
        address: theater.address,
        url: theater.url ? theater.url : null,
        prefecture_id: theater.prefecture_id,
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
