import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import getLogger from "@/lib/logger";
import { ApiResponseCode } from "@/types/ApiResponse";

const logger = getLogger("api/reviews/[id]");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  const { id } = await params;
  const reviewId = Number(id);

  if (isNaN(reviewId)) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "無効なレビューIDです",
      },
      { status: 400 }
    );
  }

  try {
    const review = await prisma.seatReview.findUnique({
      where: {
        id: reviewId,
        user_id: parseInt(userId!, 10),
      },
      include: {
        users: {
          select: {
            name: true,
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
    });

    if (!review) {
      return NextResponse.json(
        {
          code: ApiResponseCode.RESOURCE_NOT_FOUND,
          message: "レビューが見つかりません",
        },
        { status: 404 }
      );
    }

    const formattedReview = {
      id: review.id,
      seatNumber: review.seat_name,
      review: review.review,
      rating: review.rating,
      theaterName: review.seat.screen.theaters.name,
      screenName: review.seat.screen.name,
      user: { name: review.users.name },
      isBookmarked: true,
    };

    return NextResponse.json(formattedReview);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reviewId = Number(id);

  if (isNaN(reviewId)) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "無効なレビューIDです",
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { review, rating } = body;

    if (
      typeof review !== "string" ||
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          code: ApiResponseCode.INVALID_REQUEST_DATA,
          message: "無効なリクエストデータです",
        },
        { status: 400 }
      );
    }

    const updatedReview = await prisma.seatReview.update({
      where: { id: reviewId },
      data: { review, rating },
      include: {
        users: true,
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    logger.error("レビュー更新エラー:", error);
    return NextResponse.json(
      {
        code: ApiResponseCode.INTERNAL_SERVER_ERROR,
        message: "レビューの更新に失敗しました",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reviewId = Number(id);

  if (isNaN(reviewId)) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "無効なレビューIDです",
      },
      { status: 400 }
    );
  }

  try {
    await prisma.bookmark.deleteMany({
      where: { review_id: reviewId },
    });

    await prisma.seatReview.delete({
      where: { id: reviewId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error("レビュー削除エラー:", error);
    return NextResponse.json(
      {
        code: ApiResponseCode.INTERNAL_SERVER_ERROR,
        message: "レビューの削除に失敗しました",
      },
      { status: 500 }
    );
  }
}
