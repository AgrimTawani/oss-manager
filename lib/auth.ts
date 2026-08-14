import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: "read:user repo" } },
    }),
  ],
  callbacks: {
    async signIn({ profile, account }) {
      if (!profile || !account?.access_token) return false;
      const githubProfile = profile as { id: number; login: string };

      await prisma.user.upsert({
        where: { githubId: String(githubProfile.id) },
        update: {
          githubLogin: githubProfile.login,
          accessToken: account.access_token,
        },
        create: {
          githubId: String(githubProfile.id),
          githubLogin: githubProfile.login,
          accessToken: account.access_token,
        },
      });
      return true;
    },
    async jwt({ token, profile, account }) {
      // Only runs on initial sign-in, when profile/account are populated.
      if (profile && account?.access_token) {
        const githubProfile = profile as { id: number };
        const dbUser = await prisma.user.findUnique({
          where: { githubId: String(githubProfile.id) },
        });
        if (dbUser) token.userId = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        (session.user as { id?: string }).id = token.userId as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
