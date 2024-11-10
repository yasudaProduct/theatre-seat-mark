import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";
import { useSession } from "next-auth/react";

interface UserProfileProps {
  user: {
    aliasId: string;
    name: string;
    image: string | null;
  };
}

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "ユーザー名は2文字以上で入力してください。",
    })
    .max(30, {
      message: "ユーザー名は30文字以下で入力してください。",
    }),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProfileSettings({ user }: UserProfileProps) {
  const { data: session } = useSession();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
    },
  });

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    if (!session?.user?.id) return;
    console.log("onSubmit");
    console.log(data);

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

  return (
    <Card>
      <Toaster richColors />
      <CardHeader>
        <CardTitle>プロフィール設定</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <div className="flex">
                      <div className="flex-none w-8"></div>
                      <div className="flex-none w-80">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          メールアドレス
                        </label>
                        <p className="text-sm text-muted-foreground">
                          ご登録されているメールアドレスです。
                        </p>
                      </div>
                      <div className="flex-initial w-100">
                        <p>{user.aliasId}</p>
                      </div>
                    </div>
                    <div className="flex-none w-64"></div>
                    <div className="flex">
                      <div className="flex-none w-8"></div>
                      <div className="flex-initial w-80">
                        <FormLabel>ユーザー名</FormLabel>
                        <FormDescription>公開表示名です。</FormDescription>
                      </div>
                      <div className="flex-initial w-100">
                        <FormControl>
                          <Input placeholder="新しいユーザー名" {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                );
              }}
            />
            <Button type="submit">更新</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
