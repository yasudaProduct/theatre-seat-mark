import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
  }

  const userId = parseInt(session.user.id as string, 10);

  try {
    const body = await request.json();
    const { reviewId } = body;

    const bookmark = await prisma.bookmark.create({
      data: {
        user_id: userId,
        review_id: parseInt(reviewId, 10),
      },
    });
    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "ブックマークの作成に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
  }

  const userId = parseInt(session.user.id as string, 10);

  const searchParams = request.nextUrl.searchParams;
  const reviewId = searchParams.get("reviewId");

  try {
    await prisma.bookmark.delete({
      where: {
        user_id_review_id: {
          user_id: userId,
          review_id: parseInt(reviewId as string, 10),
        },
      },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "ブックマークの削除に失敗しました" },
      { status: 500 }
    );
  }
}
