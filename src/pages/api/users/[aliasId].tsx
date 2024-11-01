import getLogger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { ApiErrorResponse, ApiResponseCode } from "@/types/ApiResponse";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
const logger = getLogger("users");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { aliasId } = req.query;

  if (!aliasId) {
    return res.status(400).json({
      code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
      message: "ユーザーIDが必要です",
    } as ApiErrorResponse);
  }

  switch (req.method) {
    case "GET": {
      try {
        const user = await prisma.user.findUnique({
          select: {
            id: true,
            name: true,
            aliasId: true,
          },
          where: {
            aliasId: aliasId as string,
          },
        });
        res.status(200).json(user);
      } catch (error) {
        logger.error(error);
        res.status(500).json({
          code: ApiResponseCode.INTERNAL_SERVER_ERROR,
          message: "エラーが発生しました",
        } as ApiErrorResponse);
      }
      break;
    }
    case "PUT": {
      try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user) {
          return res.status(401).json({ message: "認証が必要です" });
        }

        const user = await prisma.user.findUnique({
          select: {
            id: true,
          },
          where: {
            aliasId: aliasId as string,
          },
        });

        if (!user || user.id !== parseInt(session!.user!.id, 10)) {
          return res.status(403).json({ message: "権限がありません" });
        }

        const newUser = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            ...req.body,
          },
        });

        const { name } = newUser;
        res.status(200).json(name);
      } catch (error) {
        logger.error(error);
        res.status(500).json({
          code: ApiResponseCode.INTERNAL_SERVER_ERROR,
          message: "エラーが発生しました",
        } as ApiErrorResponse);
      }

      break;
    }
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).json({
        code: ApiResponseCode.METHOD_NOT_ALLOWED,
        message: `Method ${req.method} Not Allowed`,
      } as ApiErrorResponse);
  }
}
