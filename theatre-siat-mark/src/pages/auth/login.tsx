import { getProviders, signIn } from "next-auth/react";
import { InferGetServerSidePropsType } from "next";
import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import router from "next/router";
import { Separator } from "@/components/ui/separator";
import { Github, Mail } from "lucide-react";

const login = ({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
