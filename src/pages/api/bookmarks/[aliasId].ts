import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { ApiErrorResponse, ApiResponseCode } from "@/types/ApiResponse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { aliasId } = req.query;

  switch (req.method) {
    case "GET":
      try {
        // user_idを取得
        const user = await prisma.user.findUnique({
          where: {
            aliasId: aliasId as string,
          },
        });

        if (!user) {
          return res.status(200).json([]);
        }

        const bookmarkedReviews = await prisma.bookmark.findMany({
          where: { user_id: user!.id },
          include: {
            review: {
              include: {
                screens: {
                  include: {
                    theaters: true,
                  },
                },
                users: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        const formattedReviews = bookmarkedReviews.map((bookmark) => ({
          id: bookmark.review.id,
          seatNumber: bookmark.review.seat_name,
          review: bookmark.review.review,
          rating: bookmark.review.rating,
          theaterName: bookmark.review.screens.theaters.name,
          screenName: bookmark.review.screens.name,
          user: { name: bookmark.review.users.name },
          isBookmarked: true,
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
