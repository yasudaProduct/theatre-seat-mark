import getLogger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { ApiErrorResponse, ApiResponseCode } from "@/types/ApiResponse";
import type { NextApiRequest, NextApiResponse } from "next";

const logger = getLogger("screens");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET": {
      const { theaterId } = req.query;
      if (theaterId || typeof theaterId === "string") {
        await getRequest(req, res, theaterId as string);
      } else {
        return res.status(400).json({
          code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
          message: "映画館IDが必要です",
        } as ApiErrorResponse);
      }
      break;
    }
    case "POST": {
      const { theaterId, name } = req.body;

      logger.debug(theaterId);
      logger.debug(name);

      if (!theaterId || !name) {
        return res.status(400).json({
          code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
          message: "映画館IDとスクリーン名は必須です。",
        } as ApiErrorResponse);
      }

      await postRequest(req, res, theaterId, name);
      break;
    }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({
        code: ApiResponseCode.METHOD_NOT_ALLOWED,
        message: `Method ${req.method} Not Allowed`,
      } as ApiErrorResponse);
  }
}

async function getRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  theaterId: string
) {
  try {
    const screens = await prisma.screen.findMany({
      where: {
        theater_id: parseInt(theaterId, 10),
      },
    });
    res.status(200).json(screens);
  } catch (error) {
    logger.error("スクリーン取得エラー:", error);
    res.status(500).json({
      code: ApiResponseCode.INTERNAL_SERVER_ERROR,
      message: "エラーが発生しました",
    } as ApiErrorResponse);
  }
}

async function postRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  theaterId: string,
  name: string
) {
  try {
    // 同一映画館内でのスクリーン名の重複をチェック
    const screen = await prisma.screen.findFirst({
      where: {
        theater_id: parseInt(theaterId, 10),
        name: name,
      },
    });
    if (screen)
      return res.status(400).json({ message: "スクリーン名が重複しています" });

    const newScreen = await prisma.screen.create({
      data: {
        theater_id: parseInt(theaterId, 10),
        name: name,
      },
    });

    res.status(201).json(newScreen);
  } catch (error) {
    logger.error("スクリーン作成エラー:", error);
    res.status(500).json({
      code: ApiResponseCode.INTERNAL_SERVER_ERROR,
      message: "エラーが発生しました",
    } as ApiErrorResponse);
  }
}
