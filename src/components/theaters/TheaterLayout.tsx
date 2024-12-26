import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loading from "../Loading";

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

export interface Review {
  id: number;
  seatName: string;
  rating: number;
  comment: string;
  isBookmarked: boolean;
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
  selectedSeat: number | null;
  onSeatSelect: (seatName: string, seatId: number) => void;
  refreshKey?: number;
}

export default function TheaterLayout({
  theater,
  selectedSeat,
  onSeatSelect,
  refreshKey = 0,
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const screenId = searchParams.get("screen");
    if (screenId) {
      setSelectScreen(screenId);
    }
  }, []);

  useEffect(() => {
    // スクリーンの座席情報・レビューを取得
    if (selectScreen) {
      setIsLoading(true);
      fetchScreenData(parseInt(selectScreen));
    }
  }, [selectScreen, refreshKey]);

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
    router.push(`/theaters/${params.id}?screen=${screenId}`, { scroll: true });
  };

  const handleSeatSelect = (seatId: number) => {
    router.push(
      `/theaters/${params.id}?screen=${selectScreen}&seat=${seatId}`,
      { scroll: true }
    );
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
    } finally {
      setIsLoading(false);
    }
  };

  const getSeatRating = (seatId: number) => {
    if (!screen || !screen.seats) return null;
    const seat: Seat | undefined = screen?.seats.find(
      (seat) => seat.id === seatId
    );

    if (!seat || seat.seat_reviews?.length == 0) return null;

    const avgRating =
      seat.seat_reviews!.reduce((acc, curr) => acc + curr.rating, 0) /
      seat.seat_reviews!.length;
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
    <div className="max-w-full px-4 sm:px-6">
      <div className="w-full max-w-md mx-auto h-8 bg-white/10 flex items-center justify-center text-sm">
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

      <div className="mt-8 -mx-4 sm:-mx-6">
        <div className="space-y-2 h-[600px] overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="min-w-fit mx-auto">
            {isLoading ? (
              <Loading />
            ) : (
              rows.map((row) => (
                <div key={row} className="flex justify-center gap-1 mb-1">
                  <div className="w-6 flex-shrink-0 flex items-center justify-center text-sm">
                    {row}
                  </div>
                  {[...Array(seatsPerRow)].map((_, index) => {
                    const seatName = `${row}${index + 1}`;
                    const seat = screen?.seats.find(
                      (s) => s.row === row && s.column === index + 1
                    );
                    const rating = getSeatRating(seat!.id);

                    return (
                      <button
                        key={seatName}
                        className={`
                w-8 h-8 rounded-t-lg text-xs font-medium transition-all
                ${getSeatColor(rating)}
                ${selectedSeat === (seat && seat.id) ? "ring-2 ring-white" : "hover:ring-2 hover:ring-white/50"}
              `}
                        onClick={() => {
                          if (seat) {
                            onSeatSelect(seatName, seat.id);
                            handleSeatSelect(seat.id);
                          }
                        }}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-sm">
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
