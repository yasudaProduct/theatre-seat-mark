import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSetting from "@/components/settings/ProfileSetting";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AccountSetting from "@/components/settings/AccountSetting";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getUserProfile(aliasId: string) {
  const user = await prisma.user.findUnique({
    where: { aliasId },
  });

  if (!user) {
    return null;
  }

  return {
    aliasId: user.aliasId!,
    name: user.name!,
    image: user.image,
  };
}

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.aliasId) {
    notFound();
  }

  const user = await getUserProfile(session.user.aliasId);

  if (!user) {
    notFound();
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
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
      </div>
    </>
  );
}
