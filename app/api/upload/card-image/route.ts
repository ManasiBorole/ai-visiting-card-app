import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/database/client";
import { apiErrorResponse, unauthorizedResponse } from "@/lib/api/error-response";
import {
  saveCardImage,
  type CardImageSide,
} from "@/services/upload.service";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const side = formData.get("side");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    if (side !== "front" && side !== "back") {
      return NextResponse.json(
        { success: false, error: "Side must be front or back" },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { success: false, error: "File is too large (max 5MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await saveCardImage(
      session.user.id,
      buffer,
      side as CardImageSide
    );

    await prisma.activityLog.create({
      data: {
        action: `Uploaded ${side} card image`,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: saved,
        message: `${
          side === "front" ? "Front" : "Back"
        } image saved successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    return apiErrorResponse(error, {
      fallbackMessage: "Failed to upload image",
      logLabel: "upload/card-image",
    });
  }
}
