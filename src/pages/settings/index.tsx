import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSetting from "@/components/settings/ProfileSetting";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma";
import AccountSetting from "@/components/settings/AccountSetting";

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
            <AccountSetting />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
