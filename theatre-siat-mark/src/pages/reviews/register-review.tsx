import React from 'react'
import { useState, useEffect } from 'react'
import router from 'next/router'
import { Theater, Screen } from '@prisma/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

const schema = zod.object({
  newScreenName: zod
    .string()
    .min(1, { message: "スクリーン名を入力してください。" })
    .max(20, { message: "スクリーン名は20文字以内で入力してください" }),
  seatNumber: zod
    .string()
    .min(1, { message: "座席番号を入力してください。" })
    .max(20, { message: "座席番号は10文字以内で入力してください" }),
  review: zod
    .string()
    .min(1, { message: "レビューを入力してください。" })
    .max(50, { message: "レビューは50文字以内で入力してください" }),
});

type FormData = zod.infer<typeof schema>;

export default function RegisterReview() {
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [screens, setScreens] = useState<Screen[]>([])
  const [selectedTheater, setSelectedTheater] = useState('')
  const [selectedScreen, setSelectedScreen] = useState('')
  const [rating, setRating] = useState(0)
  const [screenOption, setScreenOption] = useState('existing')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  useEffect(() => {
    // 映画館のデータを取得
    fetch('/api/theaters')
      .then(res => res.json())
      .then(data => setTheaters(data))
  }, [])

  useEffect(() => {
    // 選択された映画館のスクリーンを取得
    if (selectedTheater) {
      fetch(`/api/screens?theaterId=${selectedTheater}`)
        .then(res => res.json())
        .then(data => setScreens(data))
    }
  }, [selectedTheater])

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const screenId = screenOption === 'existing' ? selectedScreen : await createNewScreen(data.newScreenName)
    
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        screenId: screenId,
        seatNumber: data.newScreenName,
        review: data.review,
        rating: rating
      })
    })

    if (response.ok) {
        alert('レビューを登録しました。')
        router.push('/mypage')
    } else {
      alert('レビューの登録に失敗しました。')
    }
  }

  const createNewScreen = async (name: string) => {
    const response = await fetch('/api/screens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theaterId: selectedTheater,
        name: name
      })
    })

    if (response.ok) {
      const newScreen = await response.json()
      return newScreen.id
    } else {
      throw new Error('新しいスクリーンの作成に失敗しました。')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            座席レビュー登録
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theater">映画館</Label>
              <Select
                value={selectedTheater}
                onValueChange={setSelectedTheater}
              >
                <SelectTrigger id="theater">
                  <SelectValue placeholder="映画館を選択" />
                </SelectTrigger>
                <SelectContent>
                  {theaters.map((theater) => (
                    <SelectItem key={theater.id} value={theater.id.toString()}>
                      {theater.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>スクリーン</Label>
              <RadioGroup
                value={screenOption}
                onValueChange={setScreenOption}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="existing" />
                  <Label htmlFor="existing">既存のスクリーン</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new">新規スクリーン</Label>
                </div>
              </RadioGroup>
            </div>

            {screenOption === "existing" ? (
              <div className="space-y-2">
                <Label htmlFor="screen">スクリーン選択</Label>
                <Select
                  value={selectedScreen}
                  onValueChange={setSelectedScreen}
                >
                  <SelectTrigger id="screen">
                    <SelectValue placeholder="スクリーンを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {screens.map((screen) => (
                      <SelectItem key={screen.id} value={screen.id.toString()}>
                        {screen.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="newScreen">新規スクリーン名</Label>
                <Input
                  id="newScreenName"
                  {...register("newScreenName")}
                  placeholder="新しいスクリーン名を入力"
                />
                {errors.newScreenName && (
                  <p className="text-sm text-red-500">
                    {errors.newScreenName.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="seatNumber">座席番号</Label>
              <Input
                id="seatNumber"
                {...register("seatNumber")}
                placeholder="例: A-12"
              />
              {errors.seatNumber && (
                  <p className="text-sm text-red-500">
                    {errors.seatNumber.message}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">レビュー</Label>
              <Textarea
                id="review"
                {...register("review")}
                placeholder="レビューを入力してください"
                rows={3}
              />
              {errors.review && (
                  <p className="text-sm text-red-500">
                    {errors.review.message}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">評価（1-5）</Label>
              <Select
                value={rating.toString()}
                onValueChange={(value) => setRating(Number(value))}
              >
                <SelectTrigger id="rating">
                  <SelectValue placeholder="評価を選択" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              レビューを登録
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}