import prisma from "@/lib/prisma";
import { Prefecture } from "@/types/Prefecture";
import { Region } from "@/types/Region";
import TheatersClient from "./TheatersClient";

export const dynamic = "force-dynamic";

async function getRegions(): Promise<Region[]> {
  const regions = await prisma.region.findMany({
    select: {
      id: true,
      name: true,
      name_kana: true,
      prefecture: true,
    },
  });

  return regions.map((region) => ({
    id: region.id,
    name: region.name,
    name_kana: region.name_kana,
    prefectures: region.prefecture.map((prefecture) => ({
      id: prefecture.id,
      name: prefecture.name,
      name_kana: prefecture.name_kana,
    })) as Prefecture[],
  }));
}

export default async function TheatersPage() {
  const regions = await getRegions();

  return <TheatersClient regions={regions} />;
}
