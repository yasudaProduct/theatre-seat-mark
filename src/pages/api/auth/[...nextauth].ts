import prisma from '@/lib/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { AuthOptions, DefaultUser, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { generateRandomString } from '@/lib/utils';


export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers:[
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
    async session({session, user}) {
      console.log('session', session);
      console.log('user', user);
      if (session?.user) {
        session.user.id = user.id;
        session.user.aliasId = user.aliasId;
      }
      return session;
    },
  },
  events:{
    createUser: async (message) => {
      console.log('createUser', message);

      await prisma.user.update({
        where: { id: Number(message.user.id) },
        data: {
          aliasId: generateRandomString(7),
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