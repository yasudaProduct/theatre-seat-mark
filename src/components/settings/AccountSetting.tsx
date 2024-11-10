import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";

export default function AccountSetting() {
  const router = useRouter();
  const [isDeactivating, setIsDeactivating] = useState(false);

  async function onDeactivate() {
    setIsDeactivating(true);
    try {
      const response = await fetch("/api/auth/deleteUser", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setIsDeactivating(false);
      router.push("/");
      toast.success("アカウントを退会しました");
    } catch (error) {
      console.error("Error deleting user:", error);
      setIsDeactivating(false);
      toast.error("アカウントの退会に失敗しました");
    }
  }

  return (
    <Card>
      <Toaster richColors />
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
  );
}
