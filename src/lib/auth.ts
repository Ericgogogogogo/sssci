import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/db/client";
import { verifyPassword } from "@/lib/auth/password";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const valid = await verifyPassword(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name ?? null, image: user.image ?? null, role: user.role } as any;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account && account.provider !== "credentials") {
        const email = user.email ?? (profile as any)?.email ?? null;
        if (!email) return false;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          await prisma.user.create({
            data: {
              email,
              name: user.name ?? (profile as any)?.name ?? null,
              image: user.image ?? (profile as any)?.picture ?? null,
              passwordHash: "oauth",
              role: "FREE",
            },
          });
        } else {
          await prisma.user.update({
            where: { email },
            data: {
              name: user.name ?? existing.name,
              image: user.image ?? existing.image,
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user && (user as any).role) {
        token.role = (user as any).role;
      }
      if (user && (user as any).id) {
        token.sub = (user as any).id;
      }
      if (!token.sub && token.email) {
        const u = await prisma.user.findUnique({ where: { email: token.email as string } });
        if (u) {
          token.sub = u.id;
          token.role = u.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.role) {
        (session.user as any).role = token.role;
      }
      if (token?.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl + "/dashboard";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};