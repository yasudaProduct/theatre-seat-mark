import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Star } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

interface Review {
  id: number;
  user: { name: string };
  rating: number;
  review: string;
  bookmarkCount: number;
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
    <div>
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
                <Card
                  key={review.id}
                  className="w-80 flex-shrink-0 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    router.push(
                      `/theaters/${review.theater.id}?screen=${review.screen.id}&seat=${review.seat.id}`
                    )
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center mt-2 justify-end">
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
                        <h2 className="font-semibold truncate">
                          {review.theater.name}
                        </h2>
                        <h2 className="font-semibold truncate">
                          {review.screen.name} {review.seat.name}
                        </h2>
                        <p className="mt-2 text-sm line-clamp-3 h-24">
                          {review.review}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 truncate">
                      投稿名: {review.user.name}
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
