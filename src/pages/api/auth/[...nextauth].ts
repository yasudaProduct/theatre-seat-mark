import prisma from '@/lib/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { generateRandomString } from '@/lib/utils';


export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
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
        }
      })

    }
  },
  secret: process.env.SECRET,
  session: {
    strategy: "database",
  },
  pages: {
    signIn: '/auth/login',
  },
}

export default NextAuth(authOptions)