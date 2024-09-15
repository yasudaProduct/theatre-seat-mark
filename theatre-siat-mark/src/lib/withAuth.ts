import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";

export async function withAuth<T>(
    context: GetServerSidePropsContext,
    getServerSidePropsFunc?: (context: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<T>>
  ): Promise<GetServerSidePropsResult<T>> {
    const session = await getServerSession(context.req, context.res, authOptions);
  
    if (!session) {
      return {
        redirect: {
          destination: `/api/auth/signin?callbackUrl=${encodeURIComponent(context.resolvedUrl)}`,
          permanent: false,
        },
      };
    }
  
    if (getServerSidePropsFunc) {
      return await getServerSidePropsFunc(context);
    }
  
    return {
      props: {} as T,
    };
  }