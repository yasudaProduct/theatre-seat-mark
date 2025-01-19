import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Star } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Review {
  id: number;
  user: { name: string };
  rating: number;
  review: string;
  bookmarkCount: number;
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
  isBookmarked: boolean;
}

export default function Home() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews/popular?limit=5");
      if (response.ok) {
        const data: Review[] = await response.json();
        setReviews(data);
      } else {
        console.error("Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <section className="">
          <div className="max-w-7xl mx-auto text-center">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-200/30 to-indigo-200/30 -z-10 rounded-full"></div>
              <h2 className="text-5xl font-bold text-slate-800 mb-6 leading-tight">
                <img
                  src="/images/icon-sineposi.svg"
                  alt="logo"
                  className="inline-block mr-2 mb-2"
                />
                で
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
                  ベストな座席を記録しよう
                </span>
              </h2>
            </div>
            <p className="text-slate-600 text-lg mb-16 max-w-2xl mx-auto leading-relaxed">
              映画館の座席レビューを登録し、あなたの好みの座席を記録しよう。
            </p>
            <Link
              href="/theaters"
              className="inline-block rounded-2xl bg-[#524FFF] font-bold text-white px-12 py-4 hover:bg-blue-600 transition-colors"
            >
              レビューを登録する
            </Link>
          </div>
        </section>
        <section className="mt-4">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            最新のレビュー
          </h1>

          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex w-max space-x-4 p-4">
              {isLoading ? (
                <>
                  {[...Array(5)].map((_, index) => (
                    <Card key={index} className="w-80 flex-shrink-0">
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="min-w-[30%] flex-shrink-0 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      router.push(
                        `/theaters/${review.theater.id}?screen=${review.screen.id}&seat=${review.seat.id}`
                      )
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col justify-between h-full">
                        <div>
                          <h2 className="font-bold text-2xl truncate">
                            {review.theater.name}
                          </h2>
                          <h2 className="font-semibold text-xl truncate">
                            {review.screen.name} {review.seat.name}
                          </h2>
                          <p className="mt-2 text-sm line-clamp-3 h-12">
                            {review.review}
                          </p>
                          <div className="flex items-center mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-6 w-6 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      {/* <p className="text-sm text-gray-500 truncate">
                        投稿名: {review.user.name}
                      </p> */}
                      <p className="text-sm text-gray-500 truncate">
                        {new Date(review.createdAt).toLocaleDateString(
                          "ja-JP",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            weekday: "long",
                          }
                        )}
                      </p>
                      <div className="flex items-center gap-1">
                        <Bookmark className="text-blue-500 fill-current" />
                        <span className="text-sm text-gray-500">
                          {review.bookmarkCount}
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      </div>
      <div className="w-full">
        <img
          src="/images/about.svg"
          alt="about"
          className="w-full bg-cover bg-top mx-auto "
        ></img>
        <img
          src="/images/about2.svg"
          alt="about"
          className="w-[60%] h-auto bg-cover bg-top mx-auto"
        ></img>
        <img
          src="/images/about3.svg"
          alt="about"
          className="w-[60%] h-[451px] bg-cover bg-top mx-auto"
        ></img>
        <img
          src="/images/about4.svg"
          alt="about"
          className="w-[60%] h-[451px] bg-cover bg-top mx-auto"
        ></img>
      </div>
    </div>
  );
}
