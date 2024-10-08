import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import prisma from "@/lib/prisma";

interface UserProfileProps {
    user: {
        name: string;
        image: string;
        _count: {
            reviews: number;
            bookmarks: number;
        };
    }
    isOwnProfile: boolean
}

export const getServerSideProps: GetServerSideProps<UserProfileProps> = async (
  context
) => {
  const session = await getSession(context);
  const userId = context.params?.user_id as string;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId, 10) },
    include: {
      _count: {
        select: { seat_reviews: true, bookmarks: true },
      },
    },
  });

  if (!user) {
    return {
      notFound: true,
    };
  }

  const isOwnProfile = session?.user?.id === user.id.toString();

  return {
    props: {
      user: {
        name: user.name ?? "Unknown",
        image: user.image ?? "/avatar-placeholder.png",
        _count: {
          reviews: user._count.seat_reviews,
          bookmarks: user._count.bookmarks,
        },
      },
      isOwnProfile,
    },
  };
};

export default function UserProfile({ user, isOwnProfile }: UserProfileProps) {
  if (!user) {
    return <div>ユーザーが見つかりません</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            ユーザープロフィール
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={user.image || undefined}
                alt={user.name || "User"}
              />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            {isOwnProfile && (
              <p className="text-sm text-muted-foreground">{user.email}</p>
            )}
            <div className="flex space-x-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{user._count.reviews}</p>
                <p className="text-sm text-muted-foreground">レビュー</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{user._count.bookmarks}</p>
                <p className="text-sm text-muted-foreground">ブックマーク</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
