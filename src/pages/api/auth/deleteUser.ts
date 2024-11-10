import getLogger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { ApiErrorResponse, ApiResponseCode } from "@/types/ApiResponse";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

const logger = getLogger("api/auth/deleteUser");

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {

    const session = await getSession({ req });

    if (!session) {
        res.status(401).end();
        return;
    }

    const user_id: number = parseInt(session.user!.id);

    switch (req.method) {
        case "DELETE":
            try {
                // ブックマークを削除
                await prisma.bookmark.deleteMany({
                    where: { user_id: user_id },
                });

                // レビューを削除
                await prisma.seatReview.deleteMany({
                    where: { user_id: user_id },
                });

                await prisma.user.delete({
                    where: { id: user_id },
                });
                return res.status(204).end();
            } catch (error) {
                logger.error(error);
                res.status(500).json({
                    code: ApiResponseCode.INTERNAL_SERVER_ERROR,
                    message: "エラーが発生しました",
                } as ApiErrorResponse);
            }
            break;

        default:
            res.setHeader("Allow", ["DELETE"]);
            res.status(405).json({
                code: ApiResponseCode.METHOD_NOT_ALLOWED,
                message: `Method ${req.method} Not Allowed`,
            } as ApiErrorResponse);
    }
}
