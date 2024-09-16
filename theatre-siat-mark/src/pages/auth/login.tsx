import React, { useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import router from "next/router";
import { Separator } from "@/components/ui/separator";
import { Github, Mail } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';


const schema = zod.object({
  email: zod.string()
  .min(1, { message: 'メールアドレスを入力してください' })
  .max(50, { message: 'メールアドレスは50文字以内で入力してください' })
  .email({ message: '有効なメールアドレスを入力してください' }),
  password: zod.string()
    .min(1, { message: 'パスワードを入力してください' }),
})

type FormData = zod.infer<typeof schema>

const login = ({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })
  const [error, setError] = useState("");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setError(
        "ログインに失敗しました。メールアドレスとパスワードを確認してください。"
      );
    } else {
      router.push("/");
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            ログイン
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="メールアドレス"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="パスワード"
                {...register("password")}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              ログイン
            </Button>
          </form>
          <Separator className="my-4" />

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignIn("google")}
            >
              <Mail className="mr-2 h-4 w-4" />
              Googleでログイン
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignIn("github")}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHubでログイン
            </Button>
          </div>
        </CardContent>
        <div className="text-center text-gray-500 text-sm mb-3">
          <Link href="/auth/signup" className="mt-2">
            新規登録はこちら
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default login;

export const getServerSideProps = async () => {
  // 認証方法を取得
  const providers = await getProviders();
  return {
    props: { providers },
  };
};
