import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import getLogger from "@/lib/logger";
import { ApiResponseCode } from "@/types/ApiResponse";

const logger = getLogger("api/auth/deleteUser");

export async function DELETE() {
  const session = await auth();

  if (!session) {
    return new NextResponse(null, { status: 401 });
  }

  const user_id: number = parseInt(session.user!.id);

  try {
    await prisma.bookmark.deleteMany({
      where: { user_id: user_id },
    });

    await prisma.seatReview.deleteMany({
      where: { user_id: user_id },
    });

    await prisma.user.delete({
      where: { id: user_id },
    });

    return new NextResponse(null, { status: 204 });
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
