import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: '全てのフィールドを入力してください。' })
  }

  try {
    // メールアドレス重複確認とバリデーション
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    })
    if (existingUser) {
      return res.status(400).json({ message: 'このメールアドレスは既に使用されています。' })
    }

    // TODO メールアドレスのバリデーション

    // パスワードをハッシュ化してユーザーを作成
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    res.status(201).json({ message: 'ユーザーが正常に作成されました。', userId: user.id })
  } catch (error) {
    console.error("Failed to create user", error);

  }
}
