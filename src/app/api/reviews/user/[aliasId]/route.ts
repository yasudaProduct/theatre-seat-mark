import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ApiResponseCode } from "@/types/ApiResponse";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ aliasId: string }> }
) {
  const { aliasId } = await params;

  if (!aliasId) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "ユーザーIDが必要です",
      },
      { status: 400 }
    );
  }

  const session = await auth();
  const loginUserId = session?.user?.id
    ? parseInt(session.user.id, 10)
    : undefined;

  try {
    const user = await prisma.user.findUnique({
      where: {
        aliasId: aliasId,
      },
    });

    if (!user) {
      return NextResponse.json([]);
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
            user_id: loginUserId ?? 0,
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
