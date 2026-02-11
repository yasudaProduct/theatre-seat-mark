import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApiResponseCode } from "@/types/ApiResponse";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ aliasId: string }> }
) {
  const { aliasId } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        aliasId: aliasId,
      },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    const bookmarkedReviews = await prisma.bookmark.findMany({
      where: { user_id: user.id },
      include: {
        review: {
          include: {
            users: {
              select: {
                name: true,
                aliasId: true,
              },
            },
            seat: {
              include: {
                screen: {
                  include: {
                    theaters: true,
                  },
                },
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
      theaterName: bookmark.review.seat.screen.theaters.name,
      screenName: bookmark.review.seat.screen.name,
      user: {
        name: bookmark.review.users.name,
        aliasId: bookmark.review.users.aliasId,
      },
      isBookmarked: true,
    }));

    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return NextResponse.json(
      {
        code: ApiResponseCode.INTERNAL_SERVER_ERROR,
        message: "レビューの取得中にエラーが発生しました",
      },
      { status: 500 }
    );
  }
}
