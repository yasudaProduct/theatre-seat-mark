import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import getLogger from "@/lib/logger";
import { ApiResponseCode } from "@/types/ApiResponse";

const logger = getLogger("reviews");

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  const searchParams = request.nextUrl.searchParams;
  const seatId = searchParams.get("seatId");
  const limit = searchParams.get("limit");

  if (!seatId) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "引数が不足しています",
      },
      { status: 400 }
    );
  }

  try {
    const reviews = await prisma.seatReview.findMany({
      where: {
        seat_id: parseInt(seatId, 10),
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
          },
        },
        bookmarks: {
          where: {
            user_id: userId ? parseInt(userId, 10) : 0,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit ? parseInt(limit, 10) : undefined,
    });

    const formattedReviews = reviews.map((review) => {
      const isBookmarked = review.bookmarks.length > 0;
      return {
        id: review.id,
        seatName: review.seat_name,
        rating: review.rating,
        comment: review.review,
        createdAt: review.createdAt,
        user: {
          id: review.users.id,
          name: review.users.name,
        },
        isBookmarked,
      };
    });

    return NextResponse.json(formattedReviews);
  } catch (error) {
    logger.error(error);
    return NextResponse.json(
      {
        code: ApiResponseCode.INTERNAL_SERVER_ERROR,
        message: "エラーが発生しました",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { code: ApiResponseCode.UNAUTHORIZED, message: "認証が必要です" },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const body = await request.json();
  const { seatId, seatName, review, rating } = body;

  if (!seatId || !seatName || !review || !rating || !userId) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "引数が不足しています",
      },
      { status: 400 }
    );
  }

  try {
    const newReview = await prisma.seatReview.create({
      data: {
        seat_id: parseInt(seatId, 10),
        seat_name: seatName,
        review: review,
        rating: parseInt(rating, 10),
        user_id: parseInt(userId, 10),
      },
    });
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json(
      {
        code: ApiResponseCode.INTERNAL_SERVER_ERROR,
        message: "エラーが発生しました",
      },
      { status: 500 }
    );
  }
}
