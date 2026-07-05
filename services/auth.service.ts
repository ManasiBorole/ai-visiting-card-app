import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/database/client";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export async function registerUser(input: RegisterInput) {
  const data = registerSchema.parse(input);
  const email = data.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email,
      passwordHash,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "Registered new account",
      userId: user.id,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export async function verifyUserCredentials(email: string, password: string) {
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

  return user;
}
