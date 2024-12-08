import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import getLogger from "@/lib/logger";
const logger = getLogger("my-reviews");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: '認証が必要です' })
    }

    const userId: number = parseInt(session!.user!.id!, 10)

    if (session?.user?.email) {
      try {
        const reviews = await prisma.seatReview.findMany({
          where: { user_id: userId },
          include: {
            seat: {
              include: {
                screen: {
                  include: {
                    theaters: true,
                  },
                },
              },
            },
            bookmarks: {
              where: {
                user_id: userId
              }
            },
            users: true,
          },
          orderBy: { createdAt: "desc" },
        });

        const formattedReviews = reviews.map((review) => ({
          id: review.id,
          theaterName: review.seat.screen.theaters.name,
          screenName: review.seat.screen.name,
          seatNumber: review.seat_name,
          rating: review.rating,
          review: review.review,
          user: { username: review.users.name },
          createdAt: review.createdAt.toISOString(),
          isBookmarked: review.bookmarks.length > 0,
        }));

        res.status(200).json(formattedReviews);
      } catch (error) {
        logger.error(error);
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
