import React, { useEffect, useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { GetServerSideProps } from "next";
import prisma from "@/lib/prisma";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export interface Theater {
  id: number;
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

  const theater = await prisma.theater.findUnique({
    where: { id: parseInt(theaterId) },
    include: {
      screens: true,
    },
  });

  if (!theater) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      id: theater.id,
      name: theater.name,
      screens: theater.screens.map((screen) => ({
        id: screen.id,
        name: screen.name,
      })),
    } as Theater,
  };
};

export default function TheaterPage(theater: Theater) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);

  const handleSeatSelect = (seatName: string, seatId: number) => {
    setSelectedSeat(seatName);
    setSelectedSeatId(seatId);
  };

  const handleReviewSubmit = (review: Review) => {
    setReviews([...reviews, review]);
    setSelectedSeat(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{theater.name}</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-black/30 p-6 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              スクリーン座席マップ
            </h2>
            <TheaterLayout
              onSeatSelect={handleSeatSelect}
              selectedSeat={selectedSeat}
              theater={theater}
            />
          </div>

          <div className="bg-black/30 p-6 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-green-400" />
              最新レビュー
            </h2>
            {/* <ReviewList reviews={theater.screen.reviews} /> */}
          </div>
        </div>

        <div className="bg-black/30 p-6 rounded-xl backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            座席レビューを投稿
          </h2>
          {!selectedSeat ? (
            <div className="text-center text-white py-8">
              座席を選択して下さい。
            </div>
          ) : (
            <ReviewForm
              selectedSeat={selectedSeat}
              selectedSeatId={selectedSeatId!}
              onSubmit={handleReviewSubmit}
            />
          )}
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
  onSeatSelect: (seatName: string, seatId: number) => void;
}

function TheaterLayout({
  theater,
  selectedSeat,
  onSeatSelect,
}: TheaterLayoutProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectScreen, setSelectScreen] = useState<string | undefined>(
    undefined
  );
  const [screen, setScreen] = useState<Screen | undefined>();
  const [rows, setRows] = useState<string[]>([]);
  const [seatsPerRow, setSeatsPerRow] = useState(0);

  useEffect(() => {
    const screenId = searchParams.get("screen");
    if (screenId) {
      setSelectScreen(screenId);
    }
  }, []);

  useEffect(() => {
    // スクリーンの座席情報・レビューを取得
    if (selectScreen) {
      fetchScreenData(parseInt(selectScreen));
    }
  }, [selectScreen]);

  useEffect(() => {
    if (screen?.seats) {
      // seats から一意の row 値を抽出して昇順にソート
      const uniqueRows = Array.from(
        new Set(screen.seats.map((seat) => seat.row))
      ).sort();
      setRows(uniqueRows);

      // seats から最大の column 値を取得
      const maxColumn = Math.max(...screen.seats.map((seat) => seat.column));
      setSeatsPerRow(maxColumn);
    }
  }, [screen]);

  const handleScreenChange = (screenId: string) => {
    setSelectScreen(screenId);
    router.push(`/theaters/${params.id}?screen=${screenId}`, { scroll: false });
  };

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
      <div className="w-full h-8 bg-white/10 flex items-center justify-center text-sm">
        <select
          className="bg-black/30 text-white rounded-md p-2 w-full"
          value={selectScreen || ""}
          onChange={(e) => handleScreenChange(e.target.value)}
        >
          <option value="">スクリーンを選択してください</option>
          {theater.screens?.map((screen) => (
            <option key={screen.id} value={screen.id}>
              {screen.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row} className="flex justify-center gap-1">
            <div className="w-6 flex items-center justify-center text-sm">
              {row}
            </div>
            {[...Array(seatsPerRow)].map((_, index) => {
              const seatName = `${row}${index + 1}`;
              const seat = screen?.seats.find(
                (s) => s.row === row && s.column === index + 1
              );
              const rating = getSeatRating(seatName);

              return (
                <button
                  key={seatName}
                  className={`
              w-8 h-8 rounded-t-lg text-xs font-medium transition-all
              ${getSeatColor(rating)}
              ${selectedSeat === seatName ? "ring-2 ring-white" : "hover:ring-2 hover:ring-white/50"}
            `}
                  onClick={() => seat && onSeatSelect(seatName, seat.id)}
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

interface ReviewFormProps {
  selectedSeatId: number;
  selectedSeat: string;
  onSubmit: (review: Review) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  selectedSeatId,
  selectedSeat,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seatId: selectedSeatId,
          seatName: selectedSeat,
          rating: rating,
          review: comment,
        }),
      });

      if (!response.ok) {
        toast.error("レビューの投稿に失敗しました");
      }

      const newReview = await response.json();
      onSubmit(newReview);

      setRating(0);
      setComment("");
    } catch {
      toast.error("レビューの投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">座席番号</label>
        <div className="text-lg font-bold">{selectedSeat}</div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">評価</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="focus:outline-none"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              <Star
                className={`w-8 h-8 ${
                  value <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          コメント
        </label>
        <textarea
          id="comment"
          rows={3}
          className="w-full px-3 py-2 bg-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="座席の感想を書いてください..."
        />
      </div>

      <button
        type="submit"
        disabled={rating === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-2 px-4 rounded-lg font-medium transition-colors"
      >
        {isSubmitting ? "投稿中..." : "レビューを投稿"}
      </button>
    </form>
  );
};
