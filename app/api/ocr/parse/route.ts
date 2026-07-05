import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { parseCardText } from "@/lib/ocr/parse-card-text";

const scanSchema = z.object({
  text: z.string().min(1, "OCR text is required"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { text } = scanSchema.parse(body);
    const extracted = parseCardText(text);

    return NextResponse.json({
      success: true,
      data: extracted,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Invalid request",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to parse OCR text" },
      { status: 500 }
    );
  }
}
