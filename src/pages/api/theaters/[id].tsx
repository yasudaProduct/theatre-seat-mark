import getLogger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { ApiErrorResponse, ApiResponseCode } from "@/types/ApiResponse";
import { NextApiRequest, NextApiResponse } from "next";

const logger = getLogger("theaters");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
      message: "Invalid theater ID",
    } as ApiErrorResponse);
  }

  switch (req.method) {
    case "PUT":
      try {
        const { name, address, url, prefecture_id } = req.body;

        const theater = await prisma.theater.update({
          where: {
            id: parseInt(id, 10),
          },
          data: {
            name,
            address,
            url,
            prefecture_id,
          },
        });

        res.status(200).json(theater);
      } catch (error) {
        logger.error(error);
        res.status(500).json({
          code: ApiResponseCode.INTERNAL_SERVER_ERROR,
          message: "エラーが発生しました",
        } as ApiErrorResponse);
      }
      break;
    default:
      res.setHeader("Allow", ["PUT"]);
      res.status(405).json({
        code: ApiResponseCode.METHOD_NOT_ALLOWED,
        message: `Method ${req.method} Not Allowed`,
      } as ApiErrorResponse);
  }
}
