import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import prisma from "@/lib/prisma";
import { generateRandomString } from "@/lib/utils";
import type { Adapter } from "next-auth/adapters";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
        session.user.aliasId = user.aliasId;
        session.user.image = user.image;
        session.user.role = user.role;
      }
      return session;
    },
  },
  events: {
    createUser: async (message) => {
      await prisma.user.update({
        where: { id: Number(message.user.id) },
        data: {
          aliasId: generateRandomString(7),
          image: "images/profile-default.png",
          role: "general",
        },
      });
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});
