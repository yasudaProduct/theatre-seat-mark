import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import getLogger from "@/lib/logger";
import { ApiResponseCode } from "@/types/ApiResponse";

const logger = getLogger("theaters");

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const prefectureId = searchParams.get("prefectureId");

  try {
    let theaters;

    if (prefectureId) {
      theaters = await prisma.theater.findMany({
        where: {
          prefecture_id: parseInt(prefectureId, 10),
        },
        orderBy: {
          name: "asc",
        },
      });
    } else {
      theaters = await prisma.theater.findMany({
        orderBy: {
          name: "asc",
        },
      });
    }
    return NextResponse.json(theaters);
  } catch (error) {
    logger.error(error);
    return NextResponse.json(
      {
        code: ApiResponseCode.INTERNAL_SERVER_ERROR,
        message: "エラーが発生しました",
      },
      { status: 500 }
    );
  }
}
