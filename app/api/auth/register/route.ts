import { NextResponse } from "next/server";

import {
  apiErrorResponse,
  parseJsonBody,
} from "@/lib/api/error-response";
import {
  getClientIp,
  rateLimit,
  rateLimitResponse,
} from "@/lib/api/rate-limit";
import { registerSchema, registerUser } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`register:${ip}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!limit.allowed) {
      return rateLimitResponse(limit.retryAfterMs ?? 60_000);
    }

    const body = await parseJsonBody(request, 16 * 1024);
    const input = registerSchema.parse(body);
    const user = await registerUser(input);

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "Account created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return apiErrorResponse(error, {
      fallbackMessage: "Something went wrong. Please try again.",
      logLabel: "auth/register",
    });
  }
}
