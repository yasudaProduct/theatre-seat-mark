import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, { message: "名前は1文字以上で入力してください" })
    .max(10, { message: "名前は10文字以内で入力してください" }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function UserProfileSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user) {
      fetch(`/api/users/${session.user.aliasId}`)
        .then((res) => res.json())
        .then((data) => {
          setValue("name", data.name || "");
          setIsLoading(false);
        })
        .catch(() => {
          toast.error("ユーザー情報の取得に失敗しました");
          setIsLoading(false);
        });
    }
  }, [status, session, router, setValue]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/users/${session.user.aliasId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("プロフィールを更新しました");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("プロフィールの更新に失敗しました");
    }
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            プロフィール設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* <div className="flex justify-center">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={session?.user?.image || undefined}
                  alt={session?.user?.name || "User"}
                />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div> */}
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              プロフィールを更新
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
