import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/",
    error: "/",
  },

  callbacks: {
    /**
     * Runs immediately after Google redirects back.
     * We DON'T call Vendure here because this runs server-side —
     * any Set-Cookie from Vendure would never reach the browser.
     * Instead we store the id_token in the JWT and let the client
     * call Vendure directly (see AuthModal useEffect).
     */
    async jwt({ token, account }) {
      if (account?.id_token) {
        token.googleToken = account.id_token;
      }
      return token;
    },

    async session({ session, token }) {
      session.googleToken = token.googleToken as string | undefined;
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
