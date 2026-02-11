import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import getLogger from "@/lib/logger";
import { ApiResponseCode } from "@/types/ApiResponse";

const logger = getLogger("seats-generate");

type SeatData = {
  row: string;
  column: number;
  screen_id: number;
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { screenId, rows, columns } = body;

  if (!screenId || !rows || !columns) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "スクリーンID、行数、列数は必須です",
      },
      { status: 400 }
    );
  }

  try {
    const currentSeats = await prisma.seats.findMany({
      where: { screen_id: screenId },
      include: { seat_reviews: true },
    });

    const newSeatsData: SeatData[] = [];
    for (let r = 0; r < rows; r++) {
      const rowChar = String.fromCharCode(65 + r);
      for (let c = 1; c <= columns; c++) {
        newSeatsData.push({
          row: rowChar,
          column: c,
          screen_id: screenId,
        });
      }
    }

    const seatsToDelete = currentSeats.filter((seat) => {
      const rowIndex = seat.row.charCodeAt(0) - 65;
      return rowIndex >= rows || seat.column > columns;
    });

    await prisma.$transaction(async (tx) => {
      if (seatsToDelete.length > 0) {
        const seatIds = seatsToDelete.map((seat) => seat.id);
        await tx.seatReview.deleteMany({
          where: { seat_id: { in: seatIds } },
        });

        await tx.seats.deleteMany({
          where: { id: { in: seatIds } },
        });
      }

      for (const seatData of newSeatsData) {
        const exists = currentSeats.some(
          (seat) => seat.row === seatData.row && seat.column === seatData.column
        );
        if (!exists) {
          await tx.seats.create({ data: seatData });
        }
      }
    });

    return NextResponse.json({ message: "座席生成が完了しました" }, { status: 201 });
  } catch (error) {
    logger.error("座席生成エラー:" + error);
    return NextResponse.json(
      {
        code: ApiResponseCode.INTERNAL_SERVER_ERROR,
        message: "エラーが発生しました",
      },
      { status: 500 }
    );
  }
}
