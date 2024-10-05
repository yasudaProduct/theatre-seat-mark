import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { theaterId } = req.query;

    if (!theaterId || typeof theaterId !== "string") {
      return res.status(400).json({ message: "映画館IDが必要です" });
    }

    try {
      const screens = await prisma.screen.findMany({
        where: {
          theater_id: parseInt(theaterId, 10),
        },
      });
      res.status(200).json(screens);
    } catch (error) {
      res.status(500).json({ message: "エラーが発生しました", error });
    }

  } else if (req.method === "POST") {

    try {
      const { theaterId, name } = req.body;

      if (!theaterId || !name) {
        return res
          .status(400)
          .json({ message: "映画館IDとスクリーン名は必須です。" });
      }

      // 同一映画館内でのスクリーン名の重複をチェック
      const screen = await prisma.screen.findFirst({
        where: {
          theater_id: parseInt(theaterId, 10),
          name: name,
        },
      });
      if(screen) return res.status(400).json({ message: "スクリーン名が重複しています" });

      const newScreen = await prisma.screen.create({
        data: {
          theater_id: parseInt(theaterId, 10),
          name: name,
        },
      });

      res.status(201).json(newScreen);
    } catch (error) {
      console.error("スクリーン作成エラー:", error);
      res
        .status(500)
        .json({ message: "スクリーンの作成中にエラーが発生しました。" });
    }

  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
