import prisma from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const { screenId, seatNumber, review, rating} = req.body

        const session = await getServerSession(req, res, authOptions);
        const userId = session?.user?.id;
        if (session?.user?.email) {

            if (!screenId || !seatNumber || !review || !rating || !userId) {
                return res.status(400).json({ message: '必要な情報が不足しています' })
            }

            try {
                const newReview = await prisma.seatReview.create({
                    data: {
                        screen_id: parseInt(screenId, 10),
                        seat_name: seatNumber,
                        review: review,
                        //   rating: parseInt(rating, 10),
                        user_id: parseInt(userId!, 10)
                    }
                })
                res.status(201).json(newReview)
            } catch (error) {
                res.status(500).json({ message: 'エラーが発生しました', error })
            }
        } else {
            res.setHeader('Allow', ['POST'])
            res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    }else{
        res.status(401).send({ message: 'Unauthorized' });
    }
}