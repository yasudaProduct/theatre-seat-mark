import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]';
import { getServerSession } from 'next-auth';

// リクエストとレスポンスの型を指定しています
export default async function (req: NextApiRequest, res: NextApiResponse) {
  // ここで、req のオブジェクトから認証情報を取得しています
  const session = await getServerSession(req, res, authOptions);
  
  if (session?.user?.email) {
    const result = await prisma.article.update({
      where: {
        id: Number(req.query.id),
      },
      data: {
        users: {
          connect: { email: session?.user?.email },
        },
      },
    });
    res.json(result);
  } else {
    res.status(401).send({ message: 'Unauthorized' });
  }
}