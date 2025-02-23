import React, { useEffect, useState } from "react";
import { Heart, Info, Star, ThumbsUp } from "lucide-react";
import { GetServerSideProps } from "next";
import prisma from "@/lib/prisma";
import TheaterLayout, {
  Review,
  Theater,
} from "@/components/theaters/TheaterLayout";
import { ReviewForm } from "@/components/theaters/ReviewForm";
import { useSession } from "next-auth/react";
import ReviewList from "@/components/theaters/ReviewList";
import { useSearchParams } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link";

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
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const seatId = searchParams.get("seat")
      ? Number(searchParams.get("seat"))
      : null;

    if (seatId) {
      setSelectedSeatId(seatId);
    }

    // お気に入り確認
    const checkFavoriteStatus = async () => {
      if (!session) return;

      try {
        const response = await fetch(
          `/api/favorites/cheak?theaterId=${theater.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [session, theater.id]);

  const handleSeatSelect = (seatName: string, seatId: number) => {
    setSelectedSeat(seatName);
    setSelectedSeatId(seatId);
  };

  const handleReviewSubmit = (review: Review) => {
    setReviews([...reviews, review]);
    setRefreshKey((prevKey) => prevKey + 1);
    window.scrollTo(0, 0);
  };

  const handleFavoriteClick = async () => {
    if (!session) {
      window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(
        window.location.href
      )}`;
      return;
    }

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theaterId: theater.id,
          action: isFavorite ? "remove" : "add",
        }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold">{theater.name}</h1>
        <button
          onClick={handleFavoriteClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-white/20 transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-white"
            }`}
          />
          <span>{isFavorite ? "お気に入り解除" : "お気に入り登録"}</span>
        </button>
        <HoverCard>
          <HoverCardTrigger asChild>
            <button className="hover:text-blue-500">
              <Info className="w-6 h-6" />
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80" align="start">
            <div className="">
              スクリーン・座席の情報は運営によりメンテナンスされています。
              <br />
              実際と異なる場合は
              <Link href="/contact" className="text-blue-500 underline">
                こちら
              </Link>
              からリクエストください。
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="w-full">
        <div className="space-y-6">
          <div className="bg-gray-200 p-6 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              スクリーン座席マップ
            </h2>
            <TheaterLayout
              onSeatSelect={handleSeatSelect}
              selectedSeat={selectedSeatId}
              theater={theater}
              refreshKey={refreshKey}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-gray-200 p-6 rounded-xl backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            座席レビューを投稿
          </h2>
          {!session ? (
            <div className="text-center text-gray-800 py-8">
              レビューを投稿するには
              <a
                href={`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`}
                className="text-blue-400 hover:underline"
              >
                ログイン
              </a>
              してください。
            </div>
          ) : !selectedSeat ? (
            <div className="text-center text-gray-800 py-8">
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

        <div className="bg-gray-200 p-6 rounded-xl backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-green-400" />
            最新レビュー
          </h2>
          <ReviewList seatId={selectedSeatId} refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
