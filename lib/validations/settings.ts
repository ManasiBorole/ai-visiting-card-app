import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must be 120 characters or less"),
  email: z.string().trim().email("Enter a valid email address"),
});

export const deleteAccountSchema = z.object({
  password: z.string().optional(),
  confirmation: z.string().trim().min(1, "Confirmation is required"),
});

export const restoreBackupSchema = z.object({
  mode: z.enum(["merge", "replace"]).default("merge"),
  backup: z.object({
    version: z.string(),
    visitingCards: z.array(z.record(z.string(), z.unknown())).min(0),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type RestoreBackupInput = z.infer<typeof restoreBackupSchema>;

export const BACKUP_VERSION = "1.0";
