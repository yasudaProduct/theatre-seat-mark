import getLogger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { ApiErrorResponse, ApiResponseCode } from "@/types/ApiResponse";
import type { NextApiRequest, NextApiResponse } from "next";

const logger = getLogger("seats-generate");

type SeatData = {
    row: string;
    column: number;
    screen_id: number;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({
            code: ApiResponseCode.METHOD_NOT_ALLOWED,
            message: `Method ${req.method} Not Allowed`,
        } as ApiErrorResponse);
    }

    const { screenId, rows, columns } = req.body;

    if (!screenId || !rows || !columns) {
        return res.status(400).json({
            code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
            message: "スクリーンID、行数、列数は必須です",
        } as ApiErrorResponse);
    }

    try {

        // 1. 現在の座席データを取得
        const currentSeats = await prisma.seats.findMany({
            where: { screen_id: screenId },
            include: { seat_reviews: true },
        });

        // 2. 新しい座席の配列を生成
        const newSeatsData: SeatData[] = [];
        for (let r = 0; r < rows; r++) {
            const rowChar = String.fromCharCode(65 + r); // (A-Z)
            for (let c = 1; c <= columns; c++) {
                newSeatsData.push({
                    row: rowChar,
                    column: c,
                    screen_id: screenId
                });
            }
        }

        // 3. 削除される座席のIDを特定
        //  行番号が新しい行数を超える座席
        //  列番号が新しい列数を超える座席
        const seatsToDelete = currentSeats.filter(seat => {
            const rowIndex = seat.row.charCodeAt(0) - 65
            return rowIndex >= rows || seat.column > columns
        })

        await prisma.$transaction(async (tx) => {
            // 4.1 削除対象の座席に関連するレビューを削除
            if (seatsToDelete.length > 0) {
                const seatIds = seatsToDelete.map(seat => seat.id)
                await tx.seatReview.deleteMany({
                    where: { seat_id: { in: seatIds } }
                })

                // 4.2 座席を削除
                await tx.seats.deleteMany({
                    where: { id: { in: seatIds } }
                })
            }

            // 4.3 新しい座席を追加
            for (const seatData of newSeatsData) {
                // 既存の座席でない場合のみ追加
                const exists = currentSeats.some(
                    seat => seat.row === seatData.row && seat.column === seatData.column
                )
                if (!exists) {
                    await tx.seats.create({ data: seatData })
                }
            }
        })

        res.status(201).json({ message: "座席生成が完了しました" });
    } catch (error) {
        logger.error("座席生成エラー:" + error);
        res.status(500).json({
            code: ApiResponseCode.INTERNAL_SERVER_ERROR,
            message: "エラーが発生しました",
        } as ApiErrorResponse);
    }
}
