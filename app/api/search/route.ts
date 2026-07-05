import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  advancedSearchVisitingCards,
  getSearchTerms,
} from "@/services/search.service";
import { searchQuerySchema } from "@/lib/validations/search";
import { apiErrorResponse, unauthorizedResponse } from "@/lib/api/error-response";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const input = searchQuerySchema.parse({
      q: searchParams.get("q") ?? undefined,
      name: searchParams.get("name") ?? undefined,
      company: searchParams.get("company") ?? undefined,
      phone: searchParams.get("phone") ?? undefined,
      email: searchParams.get("email") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      state: searchParams.get("state") ?? undefined,
      gst: searchParams.get("gst") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    });

    const results = await advancedSearchVisitingCards(session.user.id, input);
    const highlightTerms = getSearchTerms(input);

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        total: results.length,
        highlightTerms,
        sort: input.sort,
      },
    });
  } catch (error) {
    return apiErrorResponse(error, {
      fallbackMessage: "Failed to search visiting cards",
      logLabel: "search",
    });
  }
}
