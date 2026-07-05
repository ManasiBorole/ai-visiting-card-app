import { z } from "zod";

export const geminiBusinessCardSchema = z.object({
  name: z.string().catch(""),
  company: z.string().catch(""),
  designation: z.string().catch(""),
  mobile: z.string().catch(""),
  alternateMobile: z.string().catch(""),
  email: z.string().catch(""),
  website: z.string().catch(""),
  address: z.string().catch(""),
  city: z.string().catch(""),
  state: z.string().catch(""),
  country: z.string().catch(""),
  pinCode: z.string().catch(""),
  gstNumber: z.string().catch(""),
  tagline: z.string().catch(""),
  services: z.array(z.string()).catch([]),
  socialMedia: z.array(z.string()).catch([]),
  extraDetails: z.string().catch(""),
});

export type GeminiBusinessCardResult = z.infer<typeof geminiBusinessCardSchema>;

export function parseGeminiJsonResponse(rawText: string): GeminiBusinessCardResult {
  const trimmed = rawText.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fencedMatch ? fencedMatch[1].trim() : trimmed;

  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }

  return geminiBusinessCardSchema.parse(parsed);
}
