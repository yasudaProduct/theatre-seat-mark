import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";
import getLogger from "@/lib/logger";
import { ApiErrorResponse, ApiResponseCode } from "@/types/ApiResponse";

const logger = getLogger("theaters");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;

  if (req.method === "POST") {
    const { screenId, seatNumber, review, rating } = req.body;

    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;
    if (session?.user?.email) {
      if (!screenId || !seatNumber || !review || !rating || !userId) {
        return res.status(400).json(
          { code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR, message: "引数が不足しています" } as ApiErrorResponse
        );
      }

      try {
        const newReview = await prisma.seatReview.create({
          data: {
            screen_id: parseInt(screenId, 10),
            seat_name: seatNumber,
            review: review,
            rating: parseInt(rating, 10),
            user_id: parseInt(userId!, 10),
          },
        });
        res.status(201).json(newReview);
      } catch (error) {
        logger.error(error);
        res.status(500).json(
          { code: ApiResponseCode.INTERNAL_SERVER_ERROR, message: "エラーが発生しました" } as ApiErrorResponse
        );
      }
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } else if (req.method === "GET") {
    try {
      const { screenId } = req.query;

      if (!screenId || typeof screenId !== "string") {
        return res.status(400).json(
          { code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR, message: "引数が不足しています" } as ApiErrorResponse
        );
      }

      const reviews = await prisma.seatReview.findMany({
        where: {
          screen_id: parseInt(screenId, 10),
        },
        include: {
          users: {
            select: {
              name: true,
            },
          },
          bookmarks: {
            where: {
              user_id: userId ? parseInt(userId!, 10) : undefined,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // ブックマークされているかどうかを判定
      const formattedReviews = reviews.map((review) => {
        const isBookmarked = review.bookmarks.length > 0;
        return {
          ...review,
          isBookmarked,
        };
      });

      res.status(200).json(formattedReviews);
    } catch (error) {
      logger.error(error);
      res.status(500).json(
        { code: ApiResponseCode.INTERNAL_SERVER_ERROR, message: "エラーが発生しました" } as ApiErrorResponse
      );
    }
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
}