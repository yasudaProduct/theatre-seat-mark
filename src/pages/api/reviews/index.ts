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

  switch (req.method) {
    case "POST":
      if (session?.user?.email) {
        await handlePostRequest(req, res, userId);
      } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
      break;

    case "GET":
      await handleGetRequest(req, res, userId);
      break;

    default:
      res.setHeader("Allow", ["POST", "GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handlePostRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string | undefined
) {
  const { seatId, seatName, review, rating } = req.body;

  console.log(seatId, seatName, review, rating, userId);

  if (!seatId || !seatName || !review || !rating || !userId) {
    return res.status(400).json(
      { code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR, message: "引数が不足しています" } as ApiErrorResponse
    );
  }



  try {
    const newReview = await prisma.seatReview.create({
      data: {
        seat_id: parseInt(seatId, 10),
        seat_name: seatName,
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
}

async function handleGetRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string | undefined
) {
  try {
    const { seatId } = req.query;

    if (!seatId || typeof seatId !== "string") {
      return res.status(400).json(
        { code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR, message: "引数が不足しています" } as ApiErrorResponse
      );
    }

    const reviews = await prisma.seatReview.findMany({
      where: {
        seat_id: parseInt(seatId, 10),
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
}