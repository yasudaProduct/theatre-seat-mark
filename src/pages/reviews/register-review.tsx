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
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { regions } from '@/data/regions'

const baseSchema = zod.object({
  seatNumber: zod
    .string()
    .min(1, { message: "座席番号を入力してください。" })
    .max(20, { message: "座席番号は10文字以内で入力してください" }),
  review: zod
    .string()
    .min(1, { message: "レビューを入力してください。" })
    .max(50, { message: "レビューは50文字以内で入力してください" }),
});

const newScreenSchema = baseSchema.extend({
  newScreenName: zod
    .string()
    .min(1, { message: "スクリーン名を入力してください。" })
    .max(20, { message: "スクリーン名は20文字以内で入力してください" }),
});

type BaseFormData = zod.infer<typeof baseSchema>;
type NewScreenFormData = zod.infer<typeof newScreenSchema>;

const fetchTheaters = async (prefectureId: string) => {
  try {
    const response = await fetch(`/api/theaters?prefectureId=${prefectureId}`)
    if (response.ok) {
      return await response.json()
    } else {
      throw new Error('Failed to fetch theaters')
    }
  } catch (error) {
    console.error('Error fetching theaters:', error)
    throw error
  }
}

export default function RegisterReview() {
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [screens, setScreens] = useState<Screen[]>([])
  const [selectedPrefecture, setSelectedPrefecture] = useState('')
  const [selectedTheater, setSelectedTheater] = useState('')
  const [selectedScreen, setSelectedScreen] = useState('')
  const [rating, setRating] = useState(0)
  const [screenOption, setScreenOption] = useState('existing')
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewScreenFormData>({
    resolver: zodResolver(screenOption === 'new' ? newScreenSchema : baseSchema),
  });
  
  useEffect(() => {
    if (selectedPrefecture) {
      fetchTheaters(selectedPrefecture)
        .then(data => setTheaters(data))
        .catch(() => toast.error('映画館の取得に失敗しました'))
    } else {
      setTheaters([])
    }
    setSelectedTheater('')
    setSelectedScreen('')
    setScreens([])
  }, [selectedPrefecture])

  useEffect(() => {
    if (selectedTheater) {
      fetch(`/api/screens?theaterId=${selectedTheater}`)
        .then(res => res.json())
        .then(data => setScreens(data))
        .catch(() => toast.error('スクリーンの取得に失敗しました'))
    } else {
      setScreens([])
    }
    setSelectedScreen('')
  }, [selectedTheater])

  useEffect(() => {
    reset();
  }, [screenOption, reset]);

  const onSubmit: SubmitHandler<BaseFormData> = async (data: { newScreenName: string; seatNumber: string; review: string }) => {
    if (!selectedTheater) {
      toast.error('映画館を選択してください')
      return
    }

    if (screenOption === 'existing' && !selectedScreen) {
      toast.error('スクリーンを選択してください')
      return
    }

    if (rating === 0) {
      toast.error('評価を選択してください')
      return
    }

    const screenId = screenOption === 'existing' ? selectedScreen : await createNewScreen(data.newScreenName)

    if(!screenId) {
      toast.error('新しいスクリーンの作成に失敗しました。')
      return
    }
    
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        screenId: screenId,
        seatNumber: data.seatNumber,
        review: data.review,
        rating: rating
      })
    })

    if (response.ok) {
      toast.success('レビューを登録しました。')
        router.push('/mypage')
    } else {
      toast.error('レビューの登録に失敗しました。')
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
      return null
    }
  }

  return (
    <div className="bg-gray-100 flex items-center justify-center p-4">
      <Toaster richColors position="top-center" />
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
              <div className="flex space-x-2">
                <div className="w-3/12">
                  <Select
                    value={selectedPrefecture}
                    onValueChange={setSelectedPrefecture}
                  >
                    <SelectTrigger id="prefectures">
                      <SelectValue placeholder="都道府県" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) =>
                        region.prefecture.map((prefecture) => (
                          <SelectItem
                            key={prefecture.id}
                            value={prefecture.id.toString()}
                          >
                            {prefecture.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-9/12">
                  <Select
                    value={selectedTheater}
                    onValueChange={setSelectedTheater}
                    disabled={!selectedPrefecture}
                  >
                    <SelectTrigger id="theater">
                      <SelectValue placeholder="映画館を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {theaters.map((theater) => (
                        <SelectItem
                          key={theater.id}
                          value={theater.id.toString()}
                        >
                          {theater.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                  disabled={!selectedTheater}
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
                <p className="text-sm text-red-500">{errors.review.message}</p>
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