import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { restoreUserBackup } from "@/services/settings.service";

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
    const result = await restoreUserBackup(session.user.id, body);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Restored ${result.imported} contact${result.imported === 1 ? "" : "s"}`,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Invalid backup file",
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to restore backup" },
      { status: 500 }
    );
  }
}
