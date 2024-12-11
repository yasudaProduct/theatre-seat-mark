import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    switch (req.method) {
        case 'POST':
            return handlePost(req, res);
        case 'GET':
            return handleGet(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }

}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { theaterId, action } = req.body;

        // リクエストの検証
        if (!theaterId || !action || !['add', 'remove'].includes(action)) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        // ユーザー情報の取得
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (action === 'add') {
            // お気に入りに追加
            await prisma.favorite.create({
                data: {
                    user_id: user.id,
                    theater_id: theaterId,
                },
            });
        } else {
            // お気に入りから削除
            await prisma.favorite.deleteMany({
                where: {
                    user_id: user.id,
                    theater_id: theaterId,
                },
            });
        }

        return res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error('Favorite operation failed:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {

    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'UserId ID is required' });
        }

        const user = await prisma.user.findUnique({
            where: { aliasId: userId as string },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const favorites = await prisma.favorite.findMany({
            where: {
                user_id: user.id,
            },
            include: {
                theater: true
            }
        });

        return res.status(200).json(
            favorites.map((favorite) => ({
                id: favorite.id,
                theater: {
                    id: favorite.theater.id,
                    name: favorite.theater.name,
                    address: favorite.theater.address,
                }
            }))
        );
    } catch (error) {
        console.error('Favorite check failed:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}