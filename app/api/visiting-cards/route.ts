import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import {
  createVisitingCard,
  getUserVisitingCardsList,
} from "@/services/visiting-card.service";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const cards = await getUserVisitingCardsList(session.user.id);

    return NextResponse.json({ success: true, data: cards });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch visiting cards" },
      { status: 500 }
    );
  }
}

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
    const card = await createVisitingCard(session.user.id, body);

    return NextResponse.json(
      {
        success: true,
        data: card,
        message: "Visiting card saved successfully",
      },
      { status: 201 }
    );
  } catch (error) {
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
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to save visiting card" },
      { status: 500 }
    );
  }
}
