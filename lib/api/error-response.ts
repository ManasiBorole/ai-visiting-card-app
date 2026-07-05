import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ApiErrorOptions = {
  fallbackMessage?: string;
  logLabel?: string;
};

export function apiErrorResponse(
  error: unknown,
  options: ApiErrorOptions = {}
) {
  const { fallbackMessage = "Something went wrong", logLabel } = options;

  if (logLabel) {
    console.error(`[${logLabel}]`, error);
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: error.issues[0]?.message ?? "Invalid input",
        errors: error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    const status = error.message.toLowerCase().includes("not found") ? 404 : 400;

    return NextResponse.json(
      { success: false, error: error.message },
      { status }
    );
  }

  return NextResponse.json(
    { success: false, error: fallbackMessage },
    { status: 500 }
  );
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

export async function parseJsonBody<T>(
  request: Request,
  maxBytes = 1024 * 1024
): Promise<T> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > maxBytes) {
    throw new Error("Request body is too large");
  }

  const text = await request.text();

  if (text.length > maxBytes) {
    throw new Error("Request body is too large");
  }

  return JSON.parse(text) as T;
}
