import getLogger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
const logger = getLogger("theaters");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const theaters = await prisma.theater.findMany();
      res.status(200).json(theaters);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "エラーが発生しました", error });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
