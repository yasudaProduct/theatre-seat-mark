import React, { useEffect, useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { GetServerSideProps } from "next";
import prisma from "@/lib/prisma";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export interface Theater {
  name: string;
  screens?: [
    {
      id: number;
      name: string;
    },
  ];
}

export const getServerSideProps: GetServerSideProps<Theater> = async (
  context
) => {
  const theaterId = context.params?.id as string;
  // const screenId = context.query.screen as string;

  const theater = await prisma.theater.findUnique({
    where: { id: parseInt(theaterId) },
    include: {
      screens: true,
    },
  });

  // console.log(theater);

  if (!theater) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      name: theater.name,
      screens: theater.screens.map((screen) => ({
        name: screen.name,
      })),
    } as Theater,
  };
};

export default function TheaterPage(theater: Theater) {
  // const [reviews, setReviews] = useState<Review[]>([]);
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
          {/* <ReviewList reviews={theater.screen.reviews} /> */}
        </div>
      </div>
    </main>
  );
}

interface Review {
  id: number;
  seatName: string;
  rating: number;
  comment: string;
}

interface Seat {
  id: number;
  row: string;
  column: number;
  seat_reviews: Review[] | undefined;
}

interface Screen {
  id: number;
  name: string;
  seats: Seat[];
}

interface TheaterLayoutProps {
  theater: Theater;
  selectedSeat: string | null;
  onSeatSelect: (seat: string) => void;
}

function TheaterLayout({
  // theater,
  selectedSeat,
  onSeatSelect,
}: TheaterLayoutProps) {
  const searchParams = useSearchParams();
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seatsPerRow = 12;
  const [selectScreen, setSelectScreen] = useState<string | undefined>(
    undefined
  );
  const [screen, setScreen] = useState<Screen | undefined>();

  useEffect(() => {
    console.log("useEffect");
    const screenId = searchParams.get("screen");
    if (screenId) {
      setSelectScreen(screenId);
    }
  }, []);

  useEffect(() => {
    console.log("screen");
    // スクリーンの座席情報・レビューを取得
    if (selectScreen) {
      fetchScreenData(parseInt(selectScreen));
    }
  }, [selectScreen]);

  useEffect(() => {}, [screen]);

  const fetchScreenData = async (screenId: number) => {
    try {
      const response = await fetch("/api/screens/" + screenId);
      if (response.ok) {
        const data: Screen = await response.json();
        setScreen(data);
      }
    } catch {
      toast.error("スクリーン情報の取得に失敗しました。");
    }
  };

  const getSeatRating = (seatName: string) => {
    if (!screen || !screen.seats) return null;
    const seat: Seat | undefined = screen?.seats.find(
      (seat) =>
        seat.row === seatName[0] && seat.column === parseInt(seatName[1])
    );

    if (!seat || seat.seat_reviews?.length == 0) return null;

    const avgRating =
      seat.seat_reviews!.reduce((acc, curr) => acc + curr.rating, 0) /
      seat.seat_reviews!.length;
    console.log(avgRating);
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
