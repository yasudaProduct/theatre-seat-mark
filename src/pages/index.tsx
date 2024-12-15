import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Review {
  id: number;
  user: { name: string };
  seatNumber: string;
  rating: number;
  review: string;
  bookmarkCount: number;
  theaterName: string;
  screenName: string;
  isBookmarked: boolean;
}

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews/popular?limit=5");
      if (response.ok) {
        const data = await response.json();
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="">人気のレビュー</h1>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
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
              <Card key={review.id} className="w-80 flex-shrink-0">
                <CardContent className="p-4">
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <h2 className="font-semibold truncate">
                        {review.theaterName}
                      </h2>
                      <h2 className="font-semibold truncate">
                        {review.screenName}
                      </h2>
                      <p className="text-sm text-gray-500 truncate">
                        座席: {review.seatNumber}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        投稿者: {review.user.name}
                      </p>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-sm line-clamp-3">
                        {review.review}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
