import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import ProfileSetting from "@/components/settings/ProfileSetting";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma";

interface UserProfileProps {
  user: {
    aliasId: string;
    name: string;
    image: string | null;
  };
}

export const getServerSideProps: GetServerSideProps<UserProfileProps> = async (
  context
) => {
  const session = await getSession(context);

  const user = await prisma.user.findUnique({
    where: { aliasId: session?.user?.aliasId },
  });

  console.log(user);

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      user: {
        aliasId: user.aliasId!,
        name: user.name!,
        image: user.image,
      },
    },
  };
};

export default function SettingsPage({ user }: UserProfileProps) {
  const [isDeactivating, setIsDeactivating] = useState(false);

  async function onDeactivate() {
    setIsDeactivating(true);
    // ここで実際のAPI呼び出しを行います
    await new Promise((resolve) => setTimeout(resolve, 2000)); // APIリクエストをシミュレート
    setIsDeactivating(false);
    toast.success("アカウントを退会しました");
  }

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">ユーザー設定</h1>
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">プロフィール</TabsTrigger>
            <TabsTrigger value="account">アカウント</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <ProfileSetting user={user} />
          </TabsContent>
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>アカウント設定</CardTitle>
                <CardDescription>
                  アカウントの管理や退会手続きを行えます。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">アカウントを退会する</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>本当に退会しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        この操作は取り消せません。すべてのデータが削除され、アカウントは完全に無効化されます。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDeactivate}
                        disabled={isDeactivating}
                      >
                        {isDeactivating ? "処理中..." : "退会する"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
