import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { readStoredCardImage } from "@/services/upload.service";

type RouteContext = {
  params: Promise<{ userId: string; filename: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const { userId, filename } = await context.params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { buffer, mimeType } = await readStoredCardImage(userId, filename);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Image not found" },
      { status: 404 }
    );
  }
}
