import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import UserProfileClient from "./UserProfileClient";

export const dynamic = "force-dynamic";

interface UserProfileData {
  aliasId: string;
  name: string;
  image: string;
  _count: {
    reviews: number;
    bookmarks: number;
  };
}

async function getUserProfile(aliasId: string): Promise<UserProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { aliasId: aliasId },
    include: {
      _count: {
        select: { seat_reviews: true, bookmarks: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    aliasId: user.aliasId!,
    name: user.name ?? "Unknown",
    image: user.image ?? "/avatar-placeholder.png",
    _count: {
      reviews: user._count.seat_reviews,
      bookmarks: user._count.bookmarks,
    },
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ aliasId: string }>;
}) {
  const session = await auth();
  const { aliasId } = await params;

  const user = await getUserProfile(aliasId);

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.aliasId === user.aliasId;

  return <UserProfileClient user={user} isOwnProfile={isOwnProfile} />;
}
