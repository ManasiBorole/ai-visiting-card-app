import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { unauthorizedResponse } from "@/lib/api/error-response";
import { detectImageMimeType } from "@/lib/security/file-validation";
import {
  extractBusinessCardFields,
  isGeminiConfigured,
} from "@/services/gemini.service";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

async function readImageFile(file: FormDataEntryValue | null, label: string) {
  if (!(file instanceof File)) {
    throw new Error(`${label} image is required`);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${label} image is too large (max 5MB)`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = detectImageMimeType(buffer);

  if (!mimeType) {
    throw new Error(`${label} image must be JPG, PNG, or WebP`);
  }

  return { buffer, mimeType };
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini API is not configured. Add GEMINI_API_KEY to your environment.",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const front = formData.get("front") ?? formData.get("file");
    const back = formData.get("back");

    const frontImage = await readImageFile(front, "Front");
    const backImage =
      back instanceof File && back.size > 0
        ? await readImageFile(back, "Back")
        : undefined;

    const extracted = await extractBusinessCardFields(frontImage, backImage);

    return NextResponse.json({
      success: true,
      data: extracted,
      source: "gemini",
    });
  } catch (error) {
    console.error("[gemini/extract]", error);

    return NextResponse.json(
      {
        success: false,
        error: "AI extraction failed. Please try again.",
      },
      { status: 502 }
    );
  }
}
