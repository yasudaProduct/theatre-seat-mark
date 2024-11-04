import type { DefaultUser } from "next-auth";

declare module 'next-auth' {
  interface Session {
    user?: DefaultUser & {
      id: string;
      aliasId: string;
      image: string | null | undefined;
    };
  }

  interface User {
    id: string;
    aliasId: string;
  }
}