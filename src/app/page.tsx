"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Star } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
                <Image
                  src="/images/about2.svg"
                  alt="logo"
                  className="inline-block mr-2 mb-2 w-full h-auto"
                  width={1000}
                  height={1000}
                />
                <br />
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
              <Image
                src="/images/about4.svg"
                alt="logo"
                className="inline-block w-full sm:w-1/2 h-auto"
                width={500}
                height={500}
              />
              <Image
                src="/images/about3.svg"
                alt="logo"
                className="inline-block w-full sm:w-1/2 h-auto"
                width={500}
                height={500}
              />
            </div>
            <div className="mt-8 mb-8 flex justify-center">
              <img
                src="/images/about6.svg"
                alt="シネポジの説明"
                className="w-[90%] sm:w-[75%] md:w-[60%] h-auto object-cover"
              />
            </div>
            <Link
              href="/theaters"
              className="inline-block rounded-2xl bg-[#524FFF] font-bold text-white px-8 sm:px-12 py-3 sm:py-4 text-sm sm:text-base hover:bg-blue-600 transition-colors"
            >
              映画館を検索する
            </Link>

            <div className="mt-8 mb-8 mx-auto border-2 border-gray-200 rounded-lg shadow-lg">
              <img
                src="/images/demonstration.gif"
                alt="シネポジの説明"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </section>
        <section className="mt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
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
                    className="min-w-[280px] sm:min-w-[300px] md:min-w-[30%] flex-shrink-0 cursor-pointer hover:bg-gray-50 transition-colors"
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
                      <p className="text-sm text-gray-500 truncate">
                        {new Date(review.createdAt).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "long",
                        })}
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
    </div>
  );
}
