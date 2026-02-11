"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import ProtectedRoute from "./ProtectedRoute";

const authRoutes = [
  "/mypage",
  "/settings",
  "/reviews/my-reviews",
  "/reviews/register-review",
];

const adminRoutes = ["/maintenances"];

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const pathname = usePathname();

  // 認証中は表示しない
  if (session.status === "loading") return null;

  // admin権限チェック
  console.log("session.data?.user?.role:", session.data?.user?.role);
  if (adminRoutes.includes(pathname) && session.data?.user?.role !== "admin") {
    return <div>404 - Not Found</div>; // または適切な404コンポーネントを表示
  }

  return (
    <>
      {authRoutes.includes(pathname) ? (
        // 現在のページが、ログインを要求するページの場合
        <ProtectedRoute>{children}</ProtectedRoute>
      ) : (
        // 現在のページが、ログインを要求しないページの場合
        children
      )}
    </>
  );
};

export default AuthWrapper;
