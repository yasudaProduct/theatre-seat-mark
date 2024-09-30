import prisma from '@/lib/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { AuthOptions, DefaultUser, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';


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
    async session({session, user}: {session: Session, user: DefaultUser}) {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
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