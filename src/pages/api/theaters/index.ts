import getLogger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { ApiErrorResponse, ApiResponseCode } from "@/types/ApiResponse";
import { Theater } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
const logger = getLogger("theaters");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const theaters: Theater[] = await prisma.theater.findMany();
      res.status(200).json(theaters);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ code: ApiResponseCode.INTERNAL_SERVER_ERROR, message: "エラーが発生しました" } as ApiErrorResponse);
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ code: ApiResponseCode.METHOD_NOT_ALLOWED, message: `Method ${req.method} Not Allowed` } as ApiErrorResponse);
  }
}
