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

export default function AccountSetting() {
  const [isDeactivating, setIsDeactivating] = useState(false);

  async function onDeactivate() {
    setIsDeactivating(true);
    // ここで実際のAPI呼び出しを行います
    await new Promise((resolve) => setTimeout(resolve, 2000)); // APIリクエストをシミュレート
    setIsDeactivating(false);
    toast.success("アカウントを退会しました");
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
