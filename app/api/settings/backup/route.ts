import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createUserBackup } from "@/services/settings.service";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const backup = await createUserBackup(session.user.id);
    const filename = `visiting-card-backup-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create backup" },
      { status: 500 }
    );
  }
}
