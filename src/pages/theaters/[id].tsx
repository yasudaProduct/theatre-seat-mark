import prisma from "@/lib/prisma";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import React from "react";

export interface Review {
  id: number;
  seatName: string;
  rating: number;
  comment: string;
}

export interface Screen {
  name: string;
  reviews: Review[];
}

export interface Theater {
  name: string;
  screen: Screen;
}

interface TheaterLayoutProps {
  theater: Theater;
  selectedSeat: string | null;
  //   onSeatSelect: (seat: string) => void;
}

export const getServerSideProps: GetServerSideProps<
  TheaterLayoutProps
> = async (context) => {
  const session = await getSession(context);
  const theaterId = context.params?.id as string;
  const screenId = context.query.screen as string;

  const theater = await prisma.theater.findUnique({
    where: { id: parseInt(theaterId) },
    include: {
      screens: {
        where: { id: parseInt(screenId) },
        include: {
          SeatReview: true,
        },
      },
    },
  });

  console.log(theater);

  if (!theater) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      theater: {
        name: theater.name,
        screen: {
          name: theater.screens[0].name,
          reviews: theater.screens[0].SeatReview.map((review) => ({
            id: review.id,
            seatName: review.seat_name,
            rating: review.rating,
            comment: review.review,
          })),
        },
      },
      selectedSeat: null,
    } as TheaterLayoutProps,
  };
};

export default function TheaterLayout({
  theater,
  selectedSeat,
  //   onSeatSelect,
}: TheaterLayoutProps) {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seatsPerRow = 12;

  const getSeatRating = (seatId: number) => {
    const seatReviews = theater.screen.reviews.filter(
      (review) => review.id === seatId
    );
    if (seatReviews.length === 0) return null;

    const avgRating =
      seatReviews.reduce((acc, curr) => acc + curr.rating, 0) /
      seatReviews.length;
    return avgRating;
  };

  const getSeatColor = (rating: number | null) => {
    if (rating === null) return "bg-gray-700";
    if (rating >= 4.5) return "bg-green-500";
    if (rating >= 3.5) return "bg-blue-500";
    if (rating >= 2.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-8">
      <div className="w-full h-8 bg-white/10 flex items-center justify-center text-sm">
        {theater.name}
        スクリーン
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row} className="flex justify-center gap-1">
            <div className="w-6 flex items-center justify-center text-sm">
              {row}
            </div>
            {[...Array(seatsPerRow)].map((_, index) => {
              const seatId = `${row}${index + 1}`;
              const rating = getSeatRating(seatId);
              return (
                <button
                  key={seatId}
                  className={`
                      w-8 h-8 rounded-t-lg text-xs font-medium transition-all
                      ${getSeatColor(rating)}
                      ${selectedSeat === seatId ? "ring-2 ring-white" : "hover:ring-2 hover:ring-white/50"}
                    `}
                  onClick={() => onSeatSelect(seatId)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>最高</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>良い</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>普通</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>悪い</span>
        </div>
      </div>
    </div>
  );
}
