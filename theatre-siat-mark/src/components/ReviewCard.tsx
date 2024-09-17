import React from "react"
import { useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Bookmark, Star } from "lucide-react"
import { Button } from "./ui/button"

export interface ReviewCardProps {
    review: {
      id: number
      user: { name: string }
      seatNumber: string
      rating: number
      review: string
      isBookmarked?: boolean
    }
}

export function ReviewCard({ review }: ReviewCardProps) {
    const [isBookmarked, setIsBookmarked] = useState(review.isBookmarked)

    const handleBookmark = async () => {
    
        const method = isBookmarked ? 'DELETE' : 'POST'
        const url = isBookmarked 
          ? `/api/bookmarks?reviewId=${review.id}`
          : '/api/bookmarks'
        try {
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: method === 'POST' ? JSON.stringify({ reviewId: review.id }) : undefined,
          })
    
          if (response.ok) {
            setIsBookmarked(!isBookmarked)
          }
        } catch (error) {
          console.error('ブックマークの更新に失敗しました', error)
        }
      }

    return (
        <Card data-testid="review-card">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{review.user.name}</p>
                <p className="text-sm text-gray-500">座席: {review.seatNumber}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBookmark}
                  aria-label={isBookmarked ? "ブックマークを解除" : "ブックマークに追加"}
                >
                  <Bookmark className={isBookmarked ? "text-blue-500 fill-current" : "text-gray-500"} />
                </Button>
              </div>
            </div>
            <p className="mt-2">{review.review}</p>
          </CardContent>
        </Card>
      )
}