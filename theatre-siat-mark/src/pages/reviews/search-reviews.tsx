import React from 'react'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Bookmark } from "lucide-react"
import { Theater, Screen } from '@prisma/client'

interface Review {
  id: number
  users: { name: string }
  seatNumber: string
  rating: number
  review: string
  isBookmarked: boolean
}

export default function SearchReviews() {
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [screens, setScreens] = useState<Screen[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [selectedTheater, setSelectedTheater] = useState('')
  const [selectedScreen, setSelectedScreen] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTheaters()
  }, [])

  useEffect(() => {
    if (selectedTheater) {
      fetchScreens(selectedTheater)
    }
  }, [selectedTheater])

  useEffect(() => {
    if (selectedScreen) {
      fetchReviews(selectedScreen)
    }
  }, [selectedScreen])

  const fetchTheaters = async () => {
    const response = await fetch('/api/theaters')
    if (response.ok) {
      const data: Theater[] = await response.json()
      setTheaters(data)
    }
  }

  const fetchScreens = async (theaterId: string) => {
    const response = await fetch(`/api/screens?theaterId=${theaterId}`)
    if (response.ok) {
      const data: Screen[] = await response.json()
      setScreens(data)
    }
  }

  const fetchReviews = async (screenId: string) => {
    const response = await fetch(`/api/reviews?screenId=${screenId}`)
    if (response.ok) {
      const data: Review[] = await response.json()
      setReviews(data)
    }
  }

  const handleBookmark = async (reviewId: number) => {

    const review = reviews.find(r => r.id === reviewId)
    if (!review) return

    const method = review.isBookmarked ? 'DELETE' : 'POST'
    const url = review.isBookmarked 
      ? `/api/bookmarks?reviewId=${reviewId}`
      : '/api/bookmarks'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify({ reviewId }) : undefined,
      })

      if (response.ok) {
        setReviews(reviews.map(r => 
          r.id === reviewId ? { ...r, isBookmarked: !r.isBookmarked } : r
        ))
      }
    } catch (error) {
      console.error('ブックマークの更新に失敗しました', error)
    }
  }

  const filteredTheaters = theaters.filter(theater =>
    theater.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">映画館・スクリーン検索とレビュー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">映画館を検索</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="映画館名を入力"
              />
            </div>
            <div>
              <Label htmlFor="theater">映画館</Label>
              <Select value={selectedTheater} onValueChange={setSelectedTheater}>
                <SelectTrigger id="theater">
                  <SelectValue placeholder="映画館を選択" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTheaters.map(theater => (
                    <SelectItem key={theater.id} value={theater.id.toString()}>
                      {theater.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTheater && (
              <div>
                <Label htmlFor="screen">スクリーン</Label>
                <Select value={selectedScreen} onValueChange={setSelectedScreen}>
                  <SelectTrigger id="screen">
                    <SelectValue placeholder="スクリーンを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {screens.map(screen => (
                      <SelectItem key={screen.id} value={screen.id.toString()}>
                        {screen.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {selectedScreen && reviews.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">レビュー一覧</h3>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{review.users.name}</p>
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
                            onClick={() => handleBookmark(review.id)}
                            aria-label={review.isBookmarked ? "ブックマークを解除" : "ブックマークに追加"}
                          >
                            <Bookmark className={review.isBookmarked ? "text-blue-500 fill-current" : "text-gray-500"} />
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2">{review.review}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {selectedScreen && reviews.length === 0 && (
            <p className="mt-4 text-center text-gray-500">このスクリーンにはまだレビューがありません。</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}