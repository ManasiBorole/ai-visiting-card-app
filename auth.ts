import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { authConfig } from "@/auth.config";
import { prisma } from "@/database/client";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const googleEnabled =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
    ...(googleEnabled
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (!user.id) {
        return true;
      }

      if (account?.provider === "credentials") {
        await prisma.activityLog.create({
          data: {
            action: "Signed in with email",
            userId: user.id,
          },
        });
      }

      if (account?.provider === "google") {
        await prisma.activityLog.create({
          data: {
            action: "Signed in with Google",
            userId: user.id,
          },
        });
      }

      return true;
    },
  },
  events: {
    async signOut(message) {
      if ("token" in message && message.token?.id) {
        await prisma.activityLog.create({
          data: {
            action: "Signed out",
            userId: message.token.id as string,
          },
        });
      }
    },
  },
});
