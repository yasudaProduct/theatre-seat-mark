import React from "react";
import { useState } from "react";
import router from "next/router";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

const schema = zod.object({
  name: zod
    .string()
    .min(1, { message: "名前を入力してください" })
    .max(8, { message: "名前は8文字以内で入力してください" }),
  email: zod
    .string()
    .min(1, { message: "メールアドレスを入力してください" })
    .max(50, { message: "メールアドレスは50文字以内で入力してください" })
    .email({ message: "有効なメールアドレスを入力してください" }),
  password: zod.string().min(1, { message: "パスワードを入力してください" }),
});

type FormData = zod.infer<typeof schema>;

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [error, setError] = useState("");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      if (res.ok) {
        // 登録成功後、自動的にログインしてホームページにリダイレクト
        const result = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        });

        if (result?.error) {
          setError("ログインに失敗しました。もう一度お試しください。");
        } else {
          router.push("/");
        }
      } else {
        const data = await res.json();
        setError(data.message || "ユーザー登録に失敗しました。");
      }
    } catch (error) {
      console.error("ユーザー登録に失敗しました", error);
      setError("サーバーエラーが発生しました。後でもう一度お試しください。");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            新規ユーザー登録
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input id="name" type="text" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              登録
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
