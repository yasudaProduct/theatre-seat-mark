import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "全てのフィールドを入力してください。" },
      { status: 400 }
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "このメールアドレスは既に使用されています。" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "ユーザーが正常に作成されました。", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create user", error);
    return NextResponse.json(
      { message: "ユーザーの作成に失敗しました" },
      { status: 500 }
    );
  }
}
