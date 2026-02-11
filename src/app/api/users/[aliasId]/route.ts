import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import getLogger from "@/lib/logger";
import { ApiResponseCode } from "@/types/ApiResponse";

const logger = getLogger("users");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ aliasId: string }> }
) {
  const { aliasId } = await params;

  if (!aliasId) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "ユーザーIDが必要です",
      },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        name: true,
        aliasId: true,
      },
      where: {
        aliasId: aliasId,
      },
    });
    return NextResponse.json(user);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ aliasId: string }> }
) {
  const { aliasId } = await params;

  if (!aliasId) {
    return NextResponse.json(
      {
        code: ApiResponseCode.ARGUMENT_PARAMETER_ERROR,
        message: "ユーザーIDが必要です",
      },
      { status: 400 }
    );
  }

  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      select: {
        id: true,
      },
      where: {
        aliasId: aliasId,
      },
    });

    if (!user || user.id !== parseInt(session.user.id, 10)) {
      return NextResponse.json({ message: "権限がありません" }, { status: 403 });
    }

    const body = await request.json();
    const newUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...body,
      },
    });

    const { name } = newUser;
    return NextResponse.json(name);
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
