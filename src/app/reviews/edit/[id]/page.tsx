import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import EditReviewClient from "./EditReviewClient";

export const dynamic = "force-dynamic";

interface Review {
  id: number;
  user: { name: string };
  seatNumber: string;
  rating: number;
  review: string;
  theaterName: string;
  screenName: string;
}

async function getReview(id: string, userId: string): Promise<Review | null> {
  try {
    const review = await prisma.seatReview.findUnique({
      where: {
        id: parseInt(id),
        user_id: parseInt(userId, 10),
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
      return null;
    }

    return {
      id: review.id,
      user: { name: review.users.name! },
      seatNumber: review.seat_name ?? "",
      rating: review.rating,
      review: review.review,
      theaterName: review.seat.screen.theaters.name,
      screenName: review.seat.screen.name,
    };
  } catch {
    return null;
  }
}

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    notFound();
  }

  const review = await getReview(id, session.user.id);

  if (!review) {
    notFound();
  }

  return <EditReviewClient review={review} />;
}
