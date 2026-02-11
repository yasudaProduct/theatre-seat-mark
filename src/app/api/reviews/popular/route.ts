import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface PopularReview {
  id: number;
  user: { name: string };
  rating: number;
  review: string;
  createdAt: string;
  theater: {
    id: number;
    name: string;
  };
  screen: {
    id: number;
    name: string;
  };
  seat: {
    id: number;
    name: string;
  };
  bookmarkCount: number;
  isBookmarked: boolean;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit") as string, 10)
    : 20;

  try {
    const reviews = await prisma.seatReview.findMany({
      include: {
        users: {
          select: { name: true },
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
        bookmarks: true,
      },
      orderBy: {
        bookmarks: {
          _count: "desc",
        },
      },
      take: limit,
    });

    const formattedReviews: PopularReview[] = reviews.map((review) => ({
      id: review.id,
      user: { name: review.users.name ?? "" },
      rating: review.rating,
      review: review.review,
      createdAt: review.createdAt.toISOString(),
      theater: {
        id: review.seat.screen.theaters.id,
        name: review.seat.screen.theaters.name,
      },
      screen: {
        id: review.seat.screen.id,
        name: review.seat.screen.name,
      },
      seat: {
        id: review.seat.id,
        name: review.seat.row + review.seat.column,
      },
      bookmarkCount: review.bookmarks.length,
      isBookmarked: userId
        ? review.bookmarks.some((b) => b.user_id === userId)
        : false,
    }));

    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error("Error fetching popular reviews:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
