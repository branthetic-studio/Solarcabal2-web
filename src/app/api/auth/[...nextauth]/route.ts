import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * NextAuth configuration
 */
const handler = NextAuth({
  // ==============================
  // Providers
  // ==============================
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // ==============================
  // Session Strategy
  // ==============================
  session: {
    strategy: "jwt", // Use JWT (recommended for App Router)
  },

  // ==============================
  // Security
  // ==============================
  secret: process.env.NEXTAUTH_SECRET,

  // ==============================
  // Custom Pages (Optional)
  // ==============================
  pages: {
    signIn: "/", // You already use modal
    error: "/", // Redirect errors to home
  },

  // ==============================
  // Callbacks
  // ==============================
  callbacks: {
    /**
     * Runs when JWT is created/updated
     */
    async jwt({ token, account, user }) {
      // Save Google ID Token
      if (account?.id_token) {
        token.googleToken = account.id_token;
      }

      return token;
    },

    /**
     * Make token available in session
     */
    async session({ session, token }) {
      session.googleToken = token.googleToken as string | undefined;

      return session;
    },
  },

  // ==============================
  // Debug (Disable in Prod)
  // ==============================
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
