import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    switch (req.method) {
        case 'GET':
            return handleGet(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }

}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { theaterId } = req.query;

        if (!theaterId) {
            return res.status(400).json({ message: 'Theater ID is required' });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const favorite = await prisma.favorite.findFirst({
            where: {
                user_id: user.id,
                theater_id: parseInt(theaterId as string),
            },
        });

        return res.status(200).json({ isFavorite: !!favorite });
    } catch (error) {
        console.error('Favorite check failed:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}