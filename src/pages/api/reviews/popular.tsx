import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

interface PopularReview {
  id: number;
  user: { name: string };
  seatNumber: string;
  rating: number;
  review: string;
  bookmarkCount: number;
  theaterName: string;
  screenName: string;
  isBookmarked: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PopularReview[] | { message: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getSession({ req });
  const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

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
      take: 20, // Limit to top 20 reviews
    });

    const formattedReviews: PopularReview[] = reviews.map((review) => ({
      id: review.id,
      user: { name: review.users.name! },
      seatNumber: review.seat_name,
      rating: review.rating,
      review: review.review,
      bookmarkCount: review.bookmarks.length,
      theaterName: review.seat.screen.theaters.name,
      screenName: review.seat.screen.name,
      isBookmarked: userId
        ? review.bookmarks.some((b) => b.user_id === userId)
        : false,
    }));

    res.status(200).json(formattedReviews);
  } catch (error) {
    console.error("Error fetching popular reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
