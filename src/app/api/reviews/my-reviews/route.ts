import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import getLogger from "@/lib/logger";

const logger = getLogger("my-reviews");

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
  }

  const userId: number = parseInt(session.user.id!, 10);

  if (!session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const reviews = await prisma.seatReview.findMany({
      where: { user_id: userId },
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
            user_id: userId,
          },
        },
        users: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      theaterName: review.seat.screen.theaters.name,
      screenName: review.seat.screen.name,
      seatNumber: review.seat_name,
      rating: review.rating,
      review: review.review,
      user: { username: review.users.name },
      createdAt: review.createdAt.toISOString(),
      isBookmarked: review.bookmarks.length > 0,
    }));

    return NextResponse.json(formattedReviews);
  } catch (error) {
    logger.error(error);
    return NextResponse.json(
      { message: "エラーが発生しました", error },
      { status: 500 }
    );
  }
}
