import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      aliasId: string;
      image: string | null | undefined;
      role: "admin" | "general";
    };
  }

  interface User extends DefaultUser {
    id: string;
    aliasId: string;
    role: "admin" | "general";
  }
}
