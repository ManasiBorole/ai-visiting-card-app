import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { runSmartSearch } from "@/services/ai.service";

const smartSearchSchema = z.object({
  query: z.string().trim().min(1, "Search query is required"),
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
    const { query } = smartSearchSchema.parse(body);
    const result = await runSmartSearch(session.user.id, query);

    return NextResponse.json({
      success: true,
      data: result.results,
      meta: {
        total: result.results.length,
        highlightTerms: result.highlightTerms,
        smartSearch: result.parsed,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? "Invalid query" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Smart search failed" },
      { status: 500 }
    );
  }
}
