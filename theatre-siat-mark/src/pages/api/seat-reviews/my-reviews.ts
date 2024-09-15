import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
// import { getServerSession } from 'next-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;

    if (session?.user?.email) {
      try {
        const reviews = await prisma.seatReview.findMany({
          where: { user_id: parseInt(userId!, 10) },
          include: {
            screens: {
              include: {
                theaters: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        const formattedReviews = reviews.map((review) => ({
          id: review.id,
          theaterName: review.screens.theaters.name,
          screenName: review.screens.name,
          seatNumber: review.seat_name,
          rating: review.rating,
          review: review.review,
          createdAt: review.createdAt.toISOString(),
        }));

        res.status(200).json(formattedReviews);
      } catch (error) {
        res.status(500).json({ message: "エラーが発生しました", error });
      }
    } else {
      res.status(401).send({ message: "Unauthorized" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
