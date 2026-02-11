import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import getLogger from "@/lib/logger";
import { ApiResponseCode } from "@/types/ApiResponse";

const logger = getLogger("theaters");

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "Invalid theater ID",
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { name, address, url, prefecture_id } = body;

    const theater = await prisma.theater.update({
      where: {
        id: parseInt(id, 10),
      },
      data: {
        name,
        address,
        url,
        prefecture_id,
      },
    });

    return NextResponse.json(theater);
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
