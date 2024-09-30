import getLogger from "@/lib/logger";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { ApiErrorResponse, ApiResponseCode } from "@/types/ApiResponse";

const logger = getLogger("api/revies/[id]");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;

  const { id } = req.query;
  const reviewId = Number(id);

  if (isNaN(reviewId)) {
    return res
      .status(400)
      .json({
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "無効なレビューIDです",
      } as ApiErrorResponse);
  }

  switch (req.method) {
    case "GET":
      try {
        const review = await prisma.seatReview.findUnique({
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
            screens: {
              include: {
                theaters: true,
              },
            },
          },
        });

        if (!review) {
          return res
            .status(404)
            .json({
              code: ApiResponseCode.RESOURCE_NOT_FOUND,
              message: "レビューが見つかりません",
            } as ApiErrorResponse);
        }

        const formattedReviews = {
          id: review.id,
          seatNumber: review.seat_name,
          review: review.review,
          rating: review.rating,
          theaterName: review.screens.theaters.name,
          screenName: review.screens.name,
          user: { name: review.users.name },
          isBookmarked: true
        };

        res.json(formattedReviews);

      } catch (error) {
        logger.error(error);
        res
          .status(500)
          .json({
            code: ApiResponseCode.INTERNAL_SERVER_ERROR,
            message: "エラーが発生しました",
          } as ApiErrorResponse);
      }
      break;

    case "PUT":
      try {
        const { review, rating } = req.body;
        if (
          typeof review !== "string" ||
          typeof rating !== "number" ||
          rating < 1 ||
          rating > 5
        ) {
          return res
            .status(400)
            .json({
              code: ApiResponseCode.INVALID_REQUEST_DATA,
              message: "無効なリクエストデータです",
            } as ApiErrorResponse);
        }

        const updatedReview = await prisma.seatReview.update({
          where: { id: reviewId },
          data: { review, rating },
          include: {
            users: true,
            screens: true,
          },
        });

        res.status(200).json(updatedReview);
        
      } catch (error) {
        logger.error("レビュー更新エラー:", error);
        res
          .status(500)
          .json({
            code: ApiResponseCode.INTERNAL_SERVER_ERROR,
            message: "レビューの更新に失敗しました",
          } as ApiErrorResponse);
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res
        .status(405)
        .json({
          code: ApiResponseCode.METHOD_NOT_ALLOWED,
          message: `Method ${req.method} Not Allowed`,
        } as ApiErrorResponse);
  }
}
