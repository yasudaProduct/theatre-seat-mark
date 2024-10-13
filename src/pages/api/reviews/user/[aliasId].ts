import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { ApiErrorResponse, ApiResponseCode } from "@/types/ApiResponse";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({
      code: ApiResponseCode.UNAUTHORIZED,
      message: "認証されていません",
    } as ApiErrorResponse);
  }

  const { aliasId } = req.query;

  if (!aliasId || typeof aliasId !== "string") {
    return res.status(400).json({
      code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
      message: "ユーザーIDが必要です",
    } as ApiErrorResponse);
  }

  switch (req.method) {
    case "GET":
      try {

        // user_idを取得
        const user = await prisma.user.findUnique({
          where: {
            aliasId: aliasId,
          },
        });

        if(!user){
          return res.status(200).json([]);
        }

        const reviews = await prisma.seatReview.findMany({
          where: {
            user_id: user.id,
          },
          include: {
            screens: {
              include: {
                theaters: true,
              },
            },
            bookmarks: {
              where: {
                user_id: parseInt(session!.user!.id, 10),
              },
            },
            users: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        const formattedReviews = reviews.map((review) => ({
          id: review.id,
          theaterName: review.screens.theaters.name,
          screenName: review.screens.name,
          seatNumber: review.seat_name,
          rating: review.rating,
          review: review.review,
          user: {username: review.users.name},
          createdAt: review.createdAt.toISOString(),
          isBookmarked: review.bookmarks.length > 0,
        }));

        res.status(200).json(formattedReviews);
      } catch (error) {
        console.error("Error fetching user reviews:", error);
        res.status(500).json({
          code: ApiResponseCode.INTERNAL_SERVER_ERROR,
          message: "レビューの取得中にエラーが発生しました",
        } as ApiErrorResponse);
      }
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({
        code: ApiResponseCode.METHOD_NOT_ALLOWED,
        message: `Method ${req.method} Not Allowed`,
      } as ApiErrorResponse);
  }
}
