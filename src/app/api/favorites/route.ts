import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { theaterId, action } = body;

    if (!theaterId || !action || !["add", "remove"].includes(action)) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (action === "add") {
      await prisma.favorite.create({
        data: {
          user_id: user.id,
          theater_id: theaterId,
        },
      });
    } else {
      await prisma.favorite.deleteMany({
        where: {
          user_id: user.id,
          theater_id: theaterId,
        },
      });
    }

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error("Favorite operation failed:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  try {
    if (!userId) {
      return NextResponse.json(
        { message: "UserId ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { aliasId: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        user_id: user.id,
      },
      include: {
        theater: true,
      },
    });

    return NextResponse.json(
      favorites.map((favorite) => ({
        id: favorite.id,
        theater: {
          id: favorite.theater.id,
          name: favorite.theater.name,
          address: favorite.theater.address,
        },
      }))
    );
  } catch (error) {
    console.error("Favorite check failed:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
