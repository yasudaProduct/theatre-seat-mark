import type { DefaultUser } from "next-auth";

declare module 'next-auth' {
  interface Session {
    user?: DefaultUser & {
      id: string;
      aliasId: string;
      image: string | null | undefined;
      role: "admin" | "general";
    };
  }

  interface User {
    id: string;
    aliasId: string;
    role: "admin" | "general";
  }
}