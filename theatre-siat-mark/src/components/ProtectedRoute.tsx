import React ,{ useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";



const ProtectedRoute = ({ children }: {children: React.ReactNode}) => {

    const router = useRouter();

    const { status } = useSession();

    useEffect(() => {
        if (status === 'unauthenticated') {
          router.push('/auth/login');
        }
      }, [router, status]); //実行タイミング ページもしくはstatusが変更された時

      if(status === 'unauthenticated') return null;

      return <>{children}</>;
}

export default ProtectedRoute;