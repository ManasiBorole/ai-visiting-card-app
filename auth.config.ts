import type { NextAuthConfig } from "next-auth";

import { ROUTES } from "@/lib/constants";

export const authConfig = {
  pages: {
    signIn: ROUTES.login,
    newUser: ROUTES.dashboard,
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
