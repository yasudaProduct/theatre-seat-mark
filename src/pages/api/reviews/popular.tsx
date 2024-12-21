import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

interface PopularReview {
  id: number;
  user: { name: string };
  seatNumber: string;
  rating: number;
  review: string;
  theater: {
    id: number;
    name: string;
  };
  screen: {
    id: number;
    name: string;
  };
  bookmarkCount: number;
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

  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

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
      seatNumber: review.seat_name ?? "",
      rating: review.rating,
      review: review.review,
      theater: {
        id: review.seat.screen.theaters.id,
        name: review.seat.screen.theaters.name,
      },
      screen: {
        id: review.seat.screen.id,
        name: review.seat.screen.name,
      },
      bookmarkCount: review.bookmarks.length,
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
