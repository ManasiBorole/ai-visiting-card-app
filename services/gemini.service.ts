import { GoogleGenerativeAI } from "@google/generative-ai";

import {
  GEMINI_BUSINESS_CARD_PROMPT,
  GEMINI_VISION_MODEL,
} from "@/lib/gemini/constants";
import {
  mapGeminiToExtractedFields,
  mergeGeminiExtractions,
} from "@/lib/gemini/map-extraction";
import {
  parseGeminiJsonResponse,
  type GeminiBusinessCardResult,
} from "@/lib/gemini/parse-response";
import type { ExtractedCardFields } from "@/types/extraction";

export type GeminiImageInput = {
  buffer: Buffer;
  mimeType: string;
};

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenerativeAI(apiKey);
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

async function analyzeImage(
  image: GeminiImageInput,
  extraInstruction?: string
): Promise<GeminiBusinessCardResult> {
  const model = getGeminiClient().getGenerativeModel({
    model: GEMINI_VISION_MODEL,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });

  const parts = [
    { text: GEMINI_BUSINESS_CARD_PROMPT },
    ...(extraInstruction ? [{ text: extraInstruction }] : []),
    {
      inlineData: {
        data: image.buffer.toString("base64"),
        mimeType: image.mimeType,
      },
    },
  ];

  const result = await model.generateContent(parts);
  const text = result.response.text();

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return parseGeminiJsonResponse(text);
}

export async function extractBusinessCard(
  image: GeminiImageInput,
  backImage?: GeminiImageInput
): Promise<GeminiBusinessCardResult> {
  const frontResult = await analyzeImage(image);

  if (!backImage) {
    return frontResult;
  }

  const backResult = await analyzeImage(
    backImage,
    "This is the back side of the same business card. Fill missing fields only."
  );

  return mergeGeminiExtractions(frontResult, backResult);
}

export async function extractBusinessCardFields(
  image: GeminiImageInput,
  backImage?: GeminiImageInput
): Promise<ExtractedCardFields> {
  const result = await extractBusinessCard(image, backImage);
  return mapGeminiToExtractedFields(result);
}
