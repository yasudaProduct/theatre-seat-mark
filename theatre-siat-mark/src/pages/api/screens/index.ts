import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { theaterId } = req.query

    if (!theaterId || typeof theaterId !== 'string') {
      return res.status(400).json({ message: '映画館IDが必要です' })
    }

    try {
      const screens = await prisma.screen.findMany({
        where: {
          theater_id: parseInt(theaterId, 10)
        }
      })
      res.status(200).json(screens)
    } catch (error) {
      res.status(500).json({ message: 'エラーが発生しました', error })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}