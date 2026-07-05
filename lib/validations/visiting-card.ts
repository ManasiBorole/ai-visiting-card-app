import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

const phoneSchema = optionalString.refine(
  (value) => !value || /^[\d\s+\-()]{7,20}$/.test(value),
  "Enter a valid phone number"
);

const emailSchema = optionalString.refine(
  (value) => !value || z.string().email().safeParse(value).success,
  "Enter a valid email address"
);

const websiteSchema = optionalString.refine((value) => {
  if (!value) return true;
  try {
    const url = value.startsWith("http") ? value : `https://${value}`;
    new URL(url);
    return true;
  } catch {
    return false;
  }
}, "Enter a valid website URL");

const pinCodeSchema = optionalString.refine(
  (value) => !value || /^[A-Za-z0-9\s-]{3,12}$/.test(value),
  "Enter a valid PIN code"
);

const gstSchema = optionalString.refine(
  (value) =>
    !value || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value),
  "Enter a valid GST number"
);

export const createVisitingCardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must be 120 characters or less"),
  company: optionalString,
  designation: optionalString,
  mobile: phoneSchema,
  alternateMobile: phoneSchema,
  email: emailSchema,
  website: websiteSchema,
  address: optionalString,
  city: optionalString,
  state: optionalString,
  pinCode: pinCodeSchema,
  gstNumber: gstSchema,
  categoryId: optionalString,
  notes: optionalString,
  frontImage: optionalString,
  backImage: optionalString,
});

export type CreateVisitingCardInput = z.infer<typeof createVisitingCardSchema>;

export const updateVisitingCardSchema = createVisitingCardSchema;

export type UpdateVisitingCardInput = z.infer<typeof updateVisitingCardSchema>;

export const visitingCardFormSchema = createVisitingCardSchema.extend({
  categoryId: z.string().optional().or(z.literal("")),
});

export type VisitingCardFormInput = z.input<typeof visitingCardFormSchema>;
