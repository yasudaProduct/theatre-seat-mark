import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // NOTE: 実際の実装では、認証されたユーザーのIDを使用します
    const userId = 1 // 仮のユーザーID

    try {
      const reviews = await prisma.seatReview.findMany({
        where: { user_id: userId },
        include: {
          screens: {
            include: {
              theaters: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const formattedReviews = reviews.map(review => ({
        id: review.id,
        theaterName: review.screens.theaters.name,
        screenName: review.screens.name,
        seatNumber: review.seat_name,
        // rating: review.rating,
        review: review.review,
        createdAt: review.createdAt.toISOString()
      }))

      res.status(200).json(formattedReviews)
    } catch (error) {
      res.status(500).json({ message: 'エラーが発生しました', error })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}