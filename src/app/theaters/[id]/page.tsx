import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import TheaterDetailClient from "./TheaterDetailClient";

export const dynamic = "force-dynamic";

async function getTheater(id: string) {
  const theater = await prisma.theater.findUnique({
    where: { id: parseInt(id) },
    include: {
      screens: {
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!theater) {
    return null;
  }

  return {
    id: theater.id,
    name: theater.name,
    screens: theater.screens.map((screen) => ({
      id: screen.id,
      name: screen.name,
    })),
  };
}

export default async function TheaterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const theater = await getTheater(id);

  if (!theater) {
    notFound();
  }

  return <TheaterDetailClient theater={theater} />;
}
