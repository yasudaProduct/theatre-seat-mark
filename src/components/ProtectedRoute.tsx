import React ,{ useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const ProtectedRoute = ({ children }: {children: React.ReactNode}) => {

    const router = useRouter();
    const pathname = usePathname()

    const { status } = useSession();

    useEffect(() => {
        if (status === 'unauthenticated') {
          router.push('/api/auth/signin' + '?callbackUrl=' + pathname);
        }
      }, [router, status]);

      if(status === 'unauthenticated') return null;

      return <>{children}</>;
}

export default ProtectedRoute;