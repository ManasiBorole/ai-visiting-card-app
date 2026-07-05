import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import {
  assignCardsToCategory,
  getAssignableCards,
  removeCardsFromCategory,
} from "@/services/category.service";
import { assignCardsSchema } from "@/lib/validations/category";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const cards = await getAssignableCards(session.user.id, id);

    return NextResponse.json({ success: true, data: cards });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignable cards" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const count = await assignCardsToCategory(session.user.id, id, body);

    return NextResponse.json({
      success: true,
      data: { count },
      message: `${count} card${count === 1 ? "" : "s"} assigned to category`,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      const status = error.message === "Category not found" ? 404 : 400;
      return NextResponse.json(
        { success: false, error: error.message },
        { status }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to assign cards" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = assignCardsSchema.parse(body);
    const count = await removeCardsFromCategory(
      session.user.id,
      parsed.cardIds
    );

    return NextResponse.json({
      success: true,
      data: { count },
      message: `${count} card${count === 1 ? "" : "s"} removed from category`,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to remove cards from category" },
      { status: 500 }
    );
  }
}
