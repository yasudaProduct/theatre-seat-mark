import { NextRequest, NextResponse } from "next/server";
import { scrapeTheatersByPrefecture } from "@/lib/theater-scraper";
import getLogger from "@/lib/logger";
import { ApiResponseCode } from "@/types/ApiResponse";

const logger = getLogger("theaters-scrape");

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const prefectureId = searchParams.get("prefectureId");

  if (!prefectureId) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "都道府県IDが必要です",
      },
      { status: 400 }
    );
  }

  try {
    const theaters = await scrapeTheatersByPrefecture(
      parseInt(prefectureId, 10)
    );

    return NextResponse.json({
      prefectureId: parseInt(prefectureId, 10),
      count: theaters.length,
      theaters,
    });
  } catch (error) {
    logger.error({ err: error }, "スクレイピングエラー");
    return NextResponse.json(
      {
        code: ApiResponseCode.INTERNAL_SERVER_ERROR,
        message: "映画館情報の取得に失敗しました",
      },
      { status: 500 }
    );
  }
}
