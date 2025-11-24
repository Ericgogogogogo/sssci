import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role?: "FREE" | "PRO" | "TEAM" | "ADMIN";
    };
  }
  interface User extends NextAuthUser {
    role?: "FREE" | "PRO" | "TEAM" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "FREE" | "PRO" | "TEAM" | "ADMIN";
  }
}