import NextAuth, { Session } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import GitHubProvider from 'next-auth/providers/github';

export const authOptions = {
  providers:[
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    session: ({ session, user }: { session: Session, user: AdapterUser }) => ({
      ...session,
      user: {
        ...user,
        id: user.id,
      }
    }),
  },
  secret: process.env.SECRET,
}

export default NextAuth(authOptions)