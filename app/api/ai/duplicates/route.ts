import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { scanAllDuplicates } from "@/services/ai.service";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const groups = await scanAllDuplicates(session.user.id);

    return NextResponse.json({
      success: true,
      data: groups,
      meta: {
        totalGroups: groups.length,
        totalMatches: groups.reduce(
          (sum, group) => sum + group.matches.length,
          0
        ),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to scan duplicates" },
      { status: 500 }
    );
  }
}
