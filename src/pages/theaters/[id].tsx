import React, { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { GetServerSideProps } from "next";
import prisma from "@/lib/prisma";

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
  screen: Screen | null;
}

export const getServerSideProps: GetServerSideProps<Theater> = async (
  context
) => {
  //   const session = await getSession(context);
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
    } as Theater,
  };
};

export interface TheaterLayoutProps {
  theater: Theater;
  selectedSeat: string | null;
  onSeatSelect: (seat: string) => void;
}
export default function TheaterPage(theater: Theater) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-black/30 p-6 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {/* <Eye className="w-5 h-5 text-blue-400" /> */}
              スクリーン座席マップ
            </h2>
            <TheaterLayout
              onSeatSelect={setSelectedSeat}
              selectedSeat={selectedSeat}
              theater={theater}
            />
          </div>

          {/* {selectedSeat && (
            <div className="bg-black/30 p-6 rounded-xl backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                座席レビューを投稿
              </h2>
              <ReviewForm
                selectedSeat={selectedSeat}
                onSubmit={handleReviewSubmit}
              />
            </div>
          )} */}
        </div>

        <div className="bg-black/30 p-6 rounded-xl backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-green-400" />
            最新レビュー
          </h2>
          <ReviewList reviews={theater.screen.reviews} />
        </div>
      </div>
    </main>
  );
}

function TheaterLayout({
  theater,
  selectedSeat,
  onSeatSelect,
}: TheaterLayoutProps) {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seatsPerRow = 12;

  const getSeatRating = (seatName: string) => {
    const seatReviews = theater.screen.reviews.filter(
      (review) => review.seatName === seatName
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
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row} className="flex justify-center gap-1">
            <div className="w-6 flex items-center justify-center text-sm">
              {row}
            </div>
            {[...Array(seatsPerRow)].map((_, index) => {
              const seatName = `${row}${index + 1}`;
              const rating = getSeatRating(seatName);
              return (
                <button
                  key={seatName}
                  className={`
                          w-8 h-8 rounded-t-lg text-xs font-medium transition-all
                          ${getSeatColor(rating)}
                          ${selectedSeat === seatName ? "ring-2 ring-white" : "hover:ring-2 hover:ring-white/50"}
                        `}
                  onClick={() => onSeatSelect(seatName)}
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

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList = ({ reviews }: ReviewListProps) => {
  //   const formatDate = (dateString: string) => {
  //     return new Date(dateString).toLocaleDateString("ja-JP", {
  //       year: "numeric",
  //       month: "long",
  //       day: "numeric",
  //     });
  //   };

  if (reviews.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        まだレビューがありません。最初のレビューを投稿してください！
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-bold text-lg mb-1">
                座席 {review.seatName}
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`w-4 h-4 ${
                      index < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {/* {formatDate(review.date)} */}
            </div>
          </div>
          <p className="text-gray-300">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};
