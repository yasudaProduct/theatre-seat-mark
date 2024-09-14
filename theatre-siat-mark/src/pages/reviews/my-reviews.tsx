import React from "react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Loader2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Review {
    id: number
    theaterName: string
    screenName: string
    seatNumber: string
    rating: number
    review: string
    createdAt: string
  }

  export default function MyReviews() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
  
    useEffect(() => {
      const fetchReviews = async () => {
        try {
          const response = await fetch('/api/seat-reviews/my-reviews')
          if (!response.ok) {
            throw new Error('レビューの取得に失敗しました')
          }
          const data = await response.json()
          setReviews(data)
        } catch (err) {
          setError(err instanceof Error ? err.message : '未知のエラーが発生しました')
        } finally {
          setIsLoading(false)
        }
      }
  
      fetchReviews()
    }, [])
  
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    }
  
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.reload()}>再試行</Button>
        </div>
      )
    }
  
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">マイレビュー一覧</h1>
        {reviews.length === 0 ? (
          <p className="text-gray-500">まだレビューがありません。</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <CardTitle>{review.theaterName}</CardTitle>
                  <CardDescription>{review.screenName} - 座席 {review.seatNumber}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{review.review}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    投稿日: {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }