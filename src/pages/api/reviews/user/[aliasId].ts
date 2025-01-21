import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { ApiErrorResponse, ApiResponseCode } from "@/types/ApiResponse";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { aliasId } = req.query;

  if (!aliasId || typeof aliasId !== "string") {
    return res.status(400).json({
      code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
      message: "ユーザーIDが必要です",
    } as ApiErrorResponse);
  }

  // ログインユーザーのIDを取得
  const session = await getServerSession(req, res, authOptions);
  const loginUserId = (session && session.user)
    ? parseInt(session.user.id as string, 10)
    : undefined;

  switch (req.method) {
    case "GET":
      try {
        // user_idを取得
        const user = await prisma.user.findUnique({
          where: {
            aliasId: aliasId,
          },
        });

        if (!user) {
          return res.status(200).json([]);
        }

        const reviews = await prisma.seatReview.findMany({
          where: {
            user_id: user.id,
          },
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
                user_id: loginUserId ?? 0, // undefinedの場合外部キーで結合される？
              },
            },
            users: {
              select: {
                name: true,
                aliasId: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        const formattedReviews = reviews.map((review) => ({
          id: review.id,
          theaterName: review.seat.screen.theaters.name,
          screenName: review.seat.screen.name,
          seatNumber: review.seat_name ?? "",
          rating: review.rating,
          review: review.review,
          user: {
            name: review.users.name ?? "",
            aliasId: review.users.aliasId ?? "",
          },
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
