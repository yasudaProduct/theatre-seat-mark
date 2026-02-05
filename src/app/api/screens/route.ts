import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import getLogger from "@/lib/logger";
import { ApiResponseCode } from "@/types/ApiResponse";

const logger = getLogger("screens");

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const theaterId = searchParams.get("theaterId");
  const fields = searchParams.get("fields");

  if (!theaterId) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "映画館IDが必要です",
      },
      { status: 400 }
    );
  }

  try {
    const screens = await prisma.screen.findMany({
      where: {
        theater_id: parseInt(theaterId, 10),
      },
      include: {
        seats: {
          include: {
            seat_reviews: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    if (fields) {
      const fieldArray = fields.split(",");

      if (fieldArray.includes("rowsCnt")) {
        let rowsCnt = 0;
        screens.forEach((screen) => {
          const uniqueRows = new Set(screen.seats.map((seat) => seat.row));
          rowsCnt = uniqueRows.size;
        });
        console.log("rowsCnt:", rowsCnt);
      }
    }

    return NextResponse.json(screens);
  } catch (error) {
    logger.error("スクリーン取得エラー:", error);
    return NextResponse.json(
      {
        code: ApiResponseCode.INTERNAL_SERVER_ERROR,
        message: "エラーが発生しました",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { theaterId, name } = body;

  logger.debug(theaterId);
  logger.debug(name);

  if (!theaterId || !name) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "映画館IDとスクリーン名は必須です。",
      },
      { status: 400 }
    );
  }

  try {
    const screen = await prisma.screen.findFirst({
      where: {
        theater_id: parseInt(theaterId, 10),
        name: name,
      },
    });

    if (screen) {
      return NextResponse.json(
        { message: "スクリーン名が重複しています" },
        { status: 400 }
      );
    }

    const newScreen = await prisma.screen.create({
      data: {
        theater_id: parseInt(theaterId, 10),
        name: name,
      },
    });

    return NextResponse.json(newScreen, { status: 201 });
  } catch (error) {
    logger.error("スクリーン作成エラー:", error);
    return NextResponse.json(
      {
        code: ApiResponseCode.INTERNAL_SERVER_ERROR,
        message: "エラーが発生しました",
      },
      { status: 500 }
    );
  }
}
