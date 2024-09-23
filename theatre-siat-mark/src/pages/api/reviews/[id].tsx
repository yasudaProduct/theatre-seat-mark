import getLogger from "@/lib/logger";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

const logger = getLogger("api/revies/[id]");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  
  if (req.method === "GET") {
    try {
      const reviews = await prisma.seatReview.findUnique({
        where: {
          id: parseInt(req.query.id as string, 10),
          user_id: parseInt(userId!, 10),
        },
        include: {
          users: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!reviews) {
        return res.status(404).end("Review not found");
      }

      res.json(reviews);

    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "エラーが発生しました", error });
    }
    
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}