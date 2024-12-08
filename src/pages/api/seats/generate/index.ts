import getLogger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { ApiErrorResponse, ApiResponseCode } from "@/types/ApiResponse";
import type { NextApiRequest, NextApiResponse } from "next";

const logger = getLogger("seats-generate");

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
        // アルファベットの配列を生成 (A-Z)
        const rowLetters = Array.from({ length: rows }, (_, i) =>
            String.fromCharCode(65 + i)
        );
        // 既存の座席を確認
        const existingSeats = await prisma.seats.findMany({
            where: {
                screen_id: screenId,
            },
            select: {
                row: true,
                column: true,
            },
        });

        // 既存の座席の位置を文字列のセットとして保持
        const existingSeatPositions = new Set(
            existingSeats.map(seat => `${seat.row}-${seat.column}`)
        );

        // 重複しない座席データのみをフィルタリング
        const filteredSeatData = rowLetters.flatMap(row =>
            Array.from({ length: columns }, (_, i) => {
                const position = `${row}-${i + 1}`;
                // 既存の座席位置と重複する場合はスキップ
                if (existingSeatPositions.has(position)) {
                    return null;
                }
                return {
                    screen_id: screenId,
                    row: row,
                    column: i + 1,
                };
            }).filter(Boolean)
        );

        // 新規に追加する座席がない場合は早期リターン
        if (filteredSeatData.length === 0) {
            return res.status(200).json({ message: "新規に追加する座席はありません" });
        }

        // 座席データを生成
        const seatData = rowLetters.flatMap(row =>
            Array.from({ length: columns }, (_, i) => ({
                screen_id: screenId,
                row: row,
                column: i + 1,
            }))
        );

        // 一括で座席を作成
        const createdSeats = await prisma.seats.createMany({
            data: seatData,
        });

        res.status(201).json(createdSeats);
    } catch (error) {
        logger.error("座席生成エラー:", error);
        res.status(500).json({
            code: ApiResponseCode.INTERNAL_SERVER_ERROR,
            message: "エラーが発生しました",
        } as ApiErrorResponse);
    }
}
