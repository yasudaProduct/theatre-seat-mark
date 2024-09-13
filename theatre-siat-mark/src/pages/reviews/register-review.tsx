import { Screen, Theater } from "@prisma/client"
import router from "next/router"
import { useEffect, useState } from "react"

export default function RegisterReview() {

    const [theaters, setTheaters] = useState<Theater[]>([])
    const [screens, setScreens] = useState<Screen[]>([])
    const [selectedTheater, setSelectedTheater] = useState('')
    const [selectedScreen, setSelectedScreen] = useState('')
    const [seatNumber, setSeatNumber] = useState('')
    const [review, setReview] = useState('')
    const [rating, setRating] = useState(0)
    // const router = useRouter()

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // seat-reviews登録API
        const response = await fetch('/api/seat-reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                screenId: selectedScreen,
                seatNumber,
                review,
                rating
            })
        })

        if (response.ok) {
            // router.push('/thank-you')
            alert('レビューの登録に成功しました。')
        } else {
            alert('レビューの登録に失敗しました。')
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">座席レビュー登録</h1>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label htmlFor="theater" className="block text-sm font-medium text-gray-700">映画館</label>
                        <select
                            id="theater"
                            value={selectedTheater}
                            onChange={(e) => setSelectedTheater(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">選択してください</option>
                            {theaters.map(theater => (
                                <option key={theater.id} value={theater.id}>{theater.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="screen" className="block text-sm font-medium text-gray-700">スクリーン</label>
                        <select
                            id="screen"
                            value={selectedScreen}
                            onChange={(e) => setSelectedScreen(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">選択してください</option>
                            {screens.map(screen => (
                                <option key={screen.id} value={screen.id}>{screen.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="seatNumber" className="block text-sm font-medium text-gray-700">座席番号</label>
                        <input
                            type="text"
                            id="seatNumber"
                            value={seatNumber}
                            onChange={(e) => setSeatNumber(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>

                    <div>
                        <label htmlFor="review" className="block text-sm font-medium text-gray-700">レビュー</label>
                        <textarea
                            id="review"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            rows={3}
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="rating" className="block text-sm font-medium text-gray-700">評価（1-5）</label>
                        <input
                            type="number"
                            id="rating"
                            min="1"
                            max="5"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        レビューを登録
                    </button>
                </form>
            </div>
        </div>
    )
}