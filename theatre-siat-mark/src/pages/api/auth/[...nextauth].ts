import prisma from '@/lib/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare } from 'bcrypt';
import NextAuth, { AuthOptions, DefaultUser, Session } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';


export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers:[
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })
        if (!user) {
          return null
        }
        const isPasswordValid = await compare(credentials.password, user.password!)
        if (!isPasswordValid) {
          return null
        }
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        }
      },
    }),
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