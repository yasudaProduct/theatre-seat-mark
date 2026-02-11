import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import getLogger from "@/lib/logger";
import { ApiResponseCode } from "@/types/ApiResponse";

const logger = getLogger("screens");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const screenId = Number(id);

  if (isNaN(screenId)) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "無効なスクリーンIDです",
      },
      { status: 400 }
    );
  }

  try {
    const screens = await prisma.screen.findUnique({
      where: {
        id: screenId,
      },
      include: {
        seats: {
          include: {
            seat_reviews: true,
          },
        },
      },
    });
    return NextResponse.json(screens);
  } catch (error) {
    logger.error("スクリーン取得エラー:" + error);
    return NextResponse.json(
      {
        code: ApiResponseCode.INTERNAL_SERVER_ERROR,
        message: "エラーが発生しました",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const screenIdParam = Number(id);

  if (isNaN(screenIdParam)) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "無効なスクリーンIDです",
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { screenId, screenName } = body;

    const screen = await prisma.screen.update({
      where: { id: screenId },
      data: {
        name: screenName,
      },
    });
    return NextResponse.json(screen);
  } catch (error) {
    logger.error("スクリーン更新エラー:" + error);
    return NextResponse.json(
      {
        code: ApiResponseCode.INTERNAL_SERVER_ERROR,
        message: "エラーが発生しました",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const screenId = Number(id);

  if (isNaN(screenId)) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "無効なスクリーンIDです",
      },
      { status: 400 }
    );
  }

  try {
    await prisma.seatReview.deleteMany({
      where: {
        seat: {
          screen_id: screenId,
        },
      },
    });

    await prisma.seats.deleteMany({
      where: {
        screen_id: screenId,
      },
    });

    await prisma.screen.delete({
      where: { id: screenId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error("スクリーン削除エラー:" + error);
    return NextResponse.json(
      {
        code: ApiResponseCode.INTERNAL_SERVER_ERROR,
        message: "エラーが発生しました",
      },
      { status: 500 }
    );
  }
}
