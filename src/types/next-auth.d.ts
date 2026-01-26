import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    googleToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleToken?: string;
  }
}
