import getLogger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { ApiErrorResponse, ApiResponseCode } from "@/types/ApiResponse";
import type { NextApiRequest, NextApiResponse } from "next";

const logger = getLogger("screens");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const screenId = Number(id);

  if (isNaN(screenId)) {
    return res.status(400).json({
      code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
      message: "無効なスクリーンIDです",
    } as ApiErrorResponse);
  }

  switch (req.method) {
    case "GET": {
      try {
        const screens = await prisma.screen.findUnique({
          where: {
            id: screenId,
          },
          include: {
            seats: {
              include: {
                seat_reviews: true,
              },
            },
          },
        });
        console.log(screens);
        res.status(200).json(screens);
      } catch (error) {
        logger.error("スクリーン取得エラー:" + error);
        res.status(500).json({
          code: ApiResponseCode.INTERNAL_SERVER_ERROR,
          message: "エラーが発生しました",
        } as ApiErrorResponse);
      }
      break;
    }
    case "DELETE": {
      try {
        // 関連する座席レビューを削除
        await prisma.seatReview.deleteMany({
          where: {
            seat: {
              screen_id: screenId,
            },
          },
        });

        // 関連する座席を削除
        await prisma.seats.deleteMany({
          where: {
            screen_id: screenId,
          },
        });

        await prisma.screen.delete({
          where: { id: screenId },
        });
        res.status(204).json({ message: "スクリーン削除成功" });
      } catch (error) {
        logger.error("スクリーン削除エラー:" + error);
        res.status(500).json({
          code: ApiResponseCode.INTERNAL_SERVER_ERROR,
          message: "エラーが発生しました",
        } as ApiErrorResponse);
      }
      break;
    }
    default:
      res.setHeader("Allow", ["GET", "DELETE"]);
      res.status(405).json({
        code: ApiResponseCode.METHOD_NOT_ALLOWED,
        message: `Method ${req.method} Not Allowed`,
      } as ApiErrorResponse);
  }
}
