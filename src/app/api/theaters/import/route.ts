import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import getLogger from "@/lib/logger";
import { ApiResponseCode } from "@/types/ApiResponse";

const logger = getLogger("theaters-import");

interface ImportScreen {
  name: string;
  seatCount: number;
}

interface ImportTheater {
  name: string;
  address: string;
  url: string | null;
  prefectureId: number;
  screens: ImportScreen[];
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { theaters } = body as { theaters: ImportTheater[] };

  if (!theaters || !Array.isArray(theaters) || theaters.length === 0) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "インポートする映画館データが必要です",
      },
      { status: 400 }
    );
  }

  try {
    const results = [];

    for (const theaterData of theaters) {
      // 同名の映画館が既に存在するかチェック
      const existing = await prisma.theater.findFirst({
        where: {
          name: theaterData.name,
          prefecture_id: theaterData.prefectureId,
        },
      });

      if (existing) {
        results.push({
          name: theaterData.name,
          status: "skipped",
          message: "既に登録済み",
        });
        continue;
      }

      // 映画館 + スクリーン + 座席をトランザクションで一括作成
      const theater = await prisma.$transaction(async (tx) => {
        const newTheater = await tx.theater.create({
          data: {
            name: theaterData.name,
            address: theaterData.address,
            url: theaterData.url,
            prefecture_id: theaterData.prefectureId,
          },
        });

        for (const screenData of theaterData.screens) {
          const screen = await tx.screen.create({
            data: {
              theater_id: newTheater.id,
              name: screenData.name,
            },
          });

          // 座席数から行列を推定して座席を生成
          if (screenData.seatCount > 0) {
            const { rows, columns } = estimateLayout(screenData.seatCount);
            const seatsData = [];
            for (let r = 0; r < rows; r++) {
              const rowChar = String.fromCharCode(65 + r);
              for (let c = 1; c <= columns; c++) {
                seatsData.push({
                  row: rowChar,
                  column: c,
                  screen_id: screen.id,
                });
              }
            }
            await tx.seats.createMany({ data: seatsData });
          }
        }

        return newTheater;
      });

      results.push({
        name: theater.name,
        id: theater.id,
        status: "created",
        screensCount: theaterData.screens.length,
      });
    }

    return NextResponse.json({ results }, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "インポートエラー");
    return NextResponse.json(
      {
        code: ApiResponseCode.INTERNAL_SERVER_ERROR,
        message: "インポート中にエラーが発生しました",
      },
      { status: 500 }
    );
  }
}

/**
 * 座席数から行列数を推定
 * 映画館の一般的なレイアウトに基づき、列:行 ≒ 1.5:1 の比率で計算
 */
function estimateLayout(seatCount: number): {
  rows: number;
  columns: number;
} {
  const ratio = 1.5;
  const rows = Math.round(Math.sqrt(seatCount / ratio));
  const columns = Math.round(seatCount / rows);
  return { rows: Math.max(rows, 1), columns: Math.max(columns, 1) };
}
