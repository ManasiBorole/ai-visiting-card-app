import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import {
  deleteVisitingCard,
  getVisitingCardById,
  updateVisitingCard,
} from "@/services/visiting-card.service";

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
    const card = await getVisitingCardById(session.user.id, id);

    if (!card) {
      return NextResponse.json(
        { success: false, error: "Visiting card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: card });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch visiting card" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
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
    const card = await updateVisitingCard(session.user.id, id, body);

    return NextResponse.json({
      success: true,
      data: card,
      message: "Visiting card updated successfully",
    });
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
      const status = error.message === "Visiting card not found" ? 404 : 400;
      return NextResponse.json(
        { success: false, error: error.message },
        { status }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update visiting card" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    await deleteVisitingCard(session.user.id, id);

    return NextResponse.json({
      success: true,
      message: "Visiting card deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message === "Visiting card not found" ? 404 : 400;
      return NextResponse.json(
        { success: false, error: error.message },
        { status }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete visiting card" },
      { status: 500 }
    );
  }
}
