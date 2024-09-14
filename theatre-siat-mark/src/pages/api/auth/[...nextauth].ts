import prisma from '@/lib/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
// import { NextApiHandler } from 'next';
import NextAuth, { DefaultUser, Session } from 'next-auth';
// import { AdapterUser } from 'next-auth/adapters';
import GitHubProvider from 'next-auth/providers/github';

// const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, authOptions);
// export default authHandler;

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers:[
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
  // pages: {
  //   signIn: '/auth/login',
  // },
}

export default NextAuth(authOptions)