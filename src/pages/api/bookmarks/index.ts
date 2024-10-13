import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: '認証が必要です' })
    }

    const userId = parseInt(session.user.id as string, 10)

    if (req.method === "POST") {
      try {
        const { reviewId } = req.body;
        const bookmark = await prisma.bookmark.create({
          data: {
            user_id: userId,
            review_id: parseInt(reviewId, 10),
          },
        });
        res.status(201).json(bookmark);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "ブックマークの作成に失敗しました" });
      }
    } else if (req.method === "DELETE") {
      try {
        const { reviewId } = req.query;
        await prisma.bookmark.delete({
          where: {
            user_id_review_id: {
              user_id: userId,
              review_id: parseInt(reviewId as string, 10),
            },
          },
        });
        res.status(204).end();
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "ブックマークの削除に失敗しました" });
      }
    } else {
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}
