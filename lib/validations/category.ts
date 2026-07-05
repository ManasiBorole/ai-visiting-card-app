import { z } from "zod";

export const CATEGORY_COLOR_PRESETS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#9333ea",
  "#dc2626",
  "#0891b2",
  "#ca8a04",
  "#64748b",
  "#db2777",
  "#4f46e5",
] as const;

const colorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9A-Fa-f]{6})$/, "Pick a valid hex color");

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be 60 characters or less"),
  color: colorSchema,
});

export const updateCategorySchema = createCategorySchema;

export const assignCardsSchema = z.object({
  cardIds: z.array(z.string().trim().min(1)).min(1, "Select at least one card"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type AssignCardsInput = z.infer<typeof assignCardsSchema>;
