import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import ProtectedRoute from "./ProtectedRoute";

const authRoutes = [
  '/mypage',
  '/reviews/my-reviews',
  '/reviews/register-review',
  '/articles/[id]'
];

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const router = useRouter();

  // 認証中は表示しない
  if (session.status === 'loading') return null;

  return (
    <>
      {authRoutes.includes(router.pathname) ? (
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